import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Copy, Check, Share2, Sparkles, Trophy, Users, ArrowLeft, AlertCircle } from "lucide-react";
import { fetchWaitlistPosition, type WaitlistPositionResponse } from "../services/waitlistApi";
import { OrangeCat, PixelFlag } from "../components/pixel/PixelArtAssets";
import { PageContainer } from "../components/layout/PageContainer";
import "./WaitlistVerifiedPage.css";

export default function WaitlistVerifiedPage() {
  const [searchParams] = useSearchParams();
  // Strictly read the user's verified code (never read or fall back to 'ref' here)
  const code = searchParams.get("code")?.trim() || "";

  const [data, setData] = useState<WaitlistPositionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      setError("No referral code was found in the verification URL.");
      return;
    }

    setLoading(true);
    setError(null);

    fetchWaitlistPosition(code)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load your waitlist position. Please check your verification link.");
        }
        setLoading(false);
      });
  }, [code]);

  // Public referral link must ALWAYS use ?ref=, never ?code=
  const publicReferralUrl =
    data?.referralLink ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${encodeURIComponent(code)}`
      : `https://life-os-snowy-xi.vercel.app/?ref=${encodeURIComponent(code)}`);

  const handleCopy = () => {
    if (!publicReferralUrl) return;
    navigator.clipboard.writeText(publicReferralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = encodeURIComponent(
    "I just joined the waitlist for Life OS — the calm operating system for tasks, calendar, habits, and AI. Join the queue here:"
  );
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(
    publicReferralUrl
  )}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(
    publicReferralUrl
  )}`;

  return (
    <div className="verified-page-canvas">
      <PageContainer className="py-16 md:py-24 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Life OS</span>
        </Link>

        {loading ? (
          <div className="verified-loading-card" role="status" aria-live="polite">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-text-secondary text-sm">Retrieving your waitlist position...</p>
          </div>
        ) : error ? (
          <div className="verified-card text-center" role="alert" aria-live="polite">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={22} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Waitlist Verification</h1>
            <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto leading-relaxed">{error}</p>
            <Link to="/" className="button-primary inline-flex">
              Return to Homepage
            </Link>
          </div>
        ) : (
          <div className="verified-card">
            {/* Mascot on top */}
            <div className="verified-cat-header" aria-hidden="true">
              <OrangeCat />
            </div>

            <div className="verified-badge-row">
              <span className="verified-status-pill">
                <CheckCircle2 size={14} className="text-emerald-400" aria-hidden="true" />
                <span>Email Verified</span>
              </span>
              <span className="verified-tier-pill">
                <Sparkles size={13} className="text-amber-400" aria-hidden="true" />
                <span>Early Access Cohort</span>
              </span>
            </div>

            <h1 className="verified-headline">
              You're on the waitlist <PixelFlag />
            </h1>
            <p className="verified-intro">
              Your email has been verified. You're officially queued for our upcoming preview rollout.
            </p>

            {/* Rank & Stats Cards */}
            <div className="verified-stats-grid">
              <div className="verified-stat-card">
                <div className="stat-icon-wrapper" aria-hidden="true">
                  <Trophy size={18} className="text-amber-400" />
                </div>
                <div>
                  <div className="stat-label">Your Current Rank</div>
                  <div className="stat-value">#{data?.position ?? "—"}</div>
                </div>
              </div>

              <div className="verified-stat-card">
                <div className="stat-icon-wrapper" aria-hidden="true">
                  <Users size={18} className="text-emerald-400" />
                </div>
                <div>
                  <div className="stat-label">Verified Referrals</div>
                  <div className="stat-value">{data?.referralCount ?? 0}</div>
                </div>
              </div>
            </div>

            {/* Referral Sharing Section */}
            <div className="referral-box">
              <div className="referral-box-header">
                <Share2 size={18} className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-text-primary text-base">
                    Invite friends to move up the waitlist
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Each verified referral improves your priority in line.
                  </p>
                </div>
              </div>

              <div className="referral-input-group">
                <input
                  type="text"
                  readOnly
                  value={publicReferralUrl}
                  className="referral-url-field"
                  aria-label="Your personal referral link"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="button-primary copy-btn"
                  aria-label={copied ? "Referral link copied" : "Copy referral link to clipboard"}
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-emerald-300" aria-hidden="true" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} aria-hidden="true" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              <div className="social-share-row">
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label="Share referral link on X (Twitter)"
                >
                  Share on X (Twitter)
                </a>
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label="Share referral link on WhatsApp"
                >
                  Share on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
