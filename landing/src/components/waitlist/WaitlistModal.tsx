import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, CheckCircle, ArrowRight, Loader2, Sparkles, ShieldCheck, RefreshCw } from "lucide-react";
import { useWaitlistModal } from "../../context/WaitlistContext";
import { submitWaitlistSignup, type WaitlistSignupResponse } from "../../services/waitlistApi";
import { getStoredReferral } from "../../hooks/useReferralCapture";
import { OrangeCat } from "../pixel/PixelArtAssets";
import "./WaitlistModal.css";

type ModalState = "idle" | "submitting" | "success" | "error";

export function WaitlistModal() {
  const { isOpen, closeWaitlist } = useWaitlistModal();
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<ModalState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [signupResult, setSignupResult] = useState<WaitlistSignupResponse | null>(null);

  // submittedAt represents when the form was rendered / opened, per upstream bot protection spec
  const formRenderedAt = useRef<number>(Date.now());
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Active referral attribution strictly from ?ref= (never from ?code=)
  const referredBy = getStoredReferral();

  // Reset and configure focus / scroll-lock when modal opens
  useEffect(() => {
    if (isOpen) {
      setState("idle");
      setErrorMessage("");
      setSignupResult(null);
      formRenderedAt.current = Date.now();

      // Prevent background scrolling while modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Move focus into modal
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key and tab focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeWaitlist();
        return;
      }

      // Accessible Focus Trap inside dialog
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([tabindex="-1"]):not([disabled]), [tabindex="0"]'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeWaitlist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setState("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setState("submitting");
    setErrorMessage("");

    try {
      const res = await submitWaitlistSignup({
        email: cleanEmail,
        referredBy,
        website: honeypot, // Honeypot field must stay empty
        submittedAt: formRenderedAt.current,
      });

      setSignupResult(res);
      setState("success");
    } catch (err: unknown) {
      setState("error");
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unable to submit waitlist request. Please try again.");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="waitlist-modal-portal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-title"
          aria-describedby="waitlist-description"
        >
          {/* Backdrop (blocks background interaction) */}
          <motion.div
            className="waitlist-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWaitlist}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            ref={modalRef}
            className="waitlist-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Mascot Peek on Top Edge */}
            <div className="waitlist-cat-peek" aria-hidden="true">
              <OrangeCat />
            </div>

            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={closeWaitlist}
              className="waitlist-close-button"
              aria-label="Close waitlist dialog"
              type="button"
            >
              <X size={18} aria-hidden="true" />
            </button>

            {state === "success" ? (
              <div className="waitlist-success-pane" role="status" aria-live="polite">
                <div className="waitlist-success-icon-badge">
                  {signupResult?.alreadyVerified ? (
                    <CheckCircle size={32} className="text-emerald-400" aria-hidden="true" />
                  ) : signupResult?.resent ? (
                    <RefreshCw size={30} className="text-amber-400" aria-hidden="true" />
                  ) : (
                    <CheckCircle size={32} className="text-emerald-400" aria-hidden="true" />
                  )}
                </div>

                <h3 className="waitlist-card-title">
                  {signupResult?.alreadyVerified
                    ? "Already Verified"
                    : signupResult?.resent
                    ? "Verification Resent"
                    : "Check your email to verify your spot"}
                </h3>

                <p className="waitlist-card-subtitle">
                  {signupResult?.message || "Check your email to verify your spot."}
                </p>

                {!signupResult?.alreadyVerified && (
                  <div className="waitlist-success-notice">
                    <div className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
                      <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
                      <span>
                        We use double opt-in verification. Please click the confirmation link sent to your inbox to lock in your waitlist position and receive your personal referral link.
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={closeWaitlist}
                  className="button-primary w-full mt-6 justify-center"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="waitlist-form-pane">
                <div className="waitlist-badge">
                  <Sparkles size={13} className="text-accent" aria-hidden="true" />
                  <span>Early Access</span>
                </div>

                <h3 id="waitlist-title" className="waitlist-card-title">
                  Join the Life OS waitlist
                </h3>
                <p id="waitlist-description" className="waitlist-card-subtitle">
                  We are rolling out invitations in batches. Sign up with your email to reserve your spot.
                </p>

                {referredBy && (
                  <div className="waitlist-referral-indicator" role="note">
                    <span>✨ Referral code attached ({referredBy})</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="waitlist-form">
                  {/* Honeypot field (excluded from tab order, must stay empty) */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="waitlist-honeypot"
                  />

                  <div className="waitlist-input-wrapper">
                    <Mail size={18} className="waitlist-input-icon" aria-hidden="true" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="waitlist-email-input"
                      disabled={state === "submitting"}
                      aria-label="Email address for waitlist"
                    />
                  </div>

                  {state === "error" && (
                    <div className="waitlist-error-message" role="alert" aria-live="polite">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={state === "submitting"}
                    className="button-primary waitlist-submit-btn"
                  >
                    {state === "submitting" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Join Waitlist</span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>

                <div className="waitlist-footer-note">
                  <span>🔒 Verified double opt-in. Unsubscribe anytime.</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
