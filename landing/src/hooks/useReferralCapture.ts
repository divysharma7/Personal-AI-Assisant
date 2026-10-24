import { useEffect } from "react";

export const REFERRAL_STORAGE_KEY = "life_os_referred_by";

/**
 * Captures incoming referral attribution strictly from ?ref=...
 *
 * CRITICAL SEMANTICS:
 * - ?ref=ABC123 represents an INCOMING referral code from an inviter.
 *   This is saved to sessionStorage under 'life_os_referred_by' to be sent
 *   to POST /api/waitlist as referredBy.
 * - ?code=ABC123 represents the VERIFIED USER'S OWN referral code on /waitlist/verified.
 *   It must NEVER be captured or stored as referredBy.
 */
export function useReferralCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      // Only capture non-empty 'ref' query parameter
      if (ref && ref.trim()) {
        sessionStorage.setItem(REFERRAL_STORAGE_KEY, ref.trim());
      }
    } catch {
      // Ignore sessionStorage errors (e.g., privacy/incognito restriction)
    }
  }, []);
}

/**
 * Retrieves the active referral attribution.
 * Prioritizes the active ?ref= URL parameter, falling back to sessionStorage.
 * Never reads or checks ?code=.
 */
export function getStoredReferral(): string | null {
  try {
    const fromParams = new URLSearchParams(window.location.search).get("ref");
    if (fromParams && fromParams.trim()) {
      return fromParams.trim();
    }
    const fromStorage = sessionStorage.getItem(REFERRAL_STORAGE_KEY);
    return fromStorage && fromStorage.trim() ? fromStorage.trim() : null;
  } catch {
    return null;
  }
}
