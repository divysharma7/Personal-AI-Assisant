/**
 * Client service for open-waitlist API integration.
 * Upstream Reference: https://github.com/zaidazmi/open-waitlist
 * Specs: docs/API.md & docs/OWN_FRONTEND.md
 */

export interface WaitlistSignupPayload {
  email: string;
  referredBy?: string | null;
  website: string; // Honeypot field (must be empty string for real users)
  submittedAt: number; // Timestamp recorded when the form rendered/opened
}

export interface WaitlistSignupResponse {
  success: boolean;
  message: string;
  alreadyVerified?: boolean;
  resent?: boolean;
}

export interface WaitlistPositionResponse {
  position: number;
  referralCount: number;
  referralLink: string;
}

interface WaitlistApiErrorResponse {
  error?: string;
  message?: string;
}

function getApiBase(): string {
  const envUrl = import.meta.env.VITE_WAITLIST_API_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, "");
  }

  // Strict check in production: never silently fake data in live builds
  if (import.meta.env.PROD) {
    const errorMsg =
      "Waitlist API is not configured. Set VITE_WAITLIST_API_URL for the production deployment.";
    console.error(`[Life OS Waitlist Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  return "";
}

/**
 * Submits a new signup or triggers a verification resend for existing unverified signups.
 * Upstream endpoint: POST /api/waitlist
 */
export async function submitWaitlistSignup(
  payload: WaitlistSignupPayload
): Promise<WaitlistSignupResponse> {
  const apiBase = getApiBase();

  // If in dev mode and no backend URL is set, provide a clear simulated response for UI testing
  if (import.meta.env.DEV && !apiBase) {
    console.warn(
      "[Waitlist Dev Simulation] VITE_WAITLIST_API_URL not set. Simulating pending verification."
    );
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      message: "Check your email to verify your spot! (Dev simulation: backend URL not set)",
    };
  }

  const endpoint = `${apiBase}/api/waitlist`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        referredBy: payload.referredBy && payload.referredBy.trim() ? payload.referredBy.trim() : null,
        website: payload.website ?? "",
        submittedAt: payload.submittedAt,
      }),
    });
  } catch (netErr: unknown) {
    const msg = netErr instanceof Error ? netErr.message : "Network error";
    console.error("[Waitlist Network Error]", netErr);
    throw new Error(`Unable to connect to the waitlist service (${msg}). Please check your internet connection.`);
  }

  let data: (WaitlistSignupResponse & WaitlistApiErrorResponse) | null = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(
        data?.error || "Too many signup requests. Please wait a moment and try again."
      );
    }
    if (response.status >= 500) {
      throw new Error(
        data?.error || "Waitlist service temporarily unavailable. Please try again shortly."
      );
    }
    throw new Error(
      data?.error || data?.message || "Failed to join the waitlist. Please check your information."
    );
  }

  if (!data?.success) {
    throw new Error(data?.error || data?.message || "Unexpected response from waitlist service.");
  }

  return {
    success: true,
    message: data.message || "Check your email to verify your spot!",
    alreadyVerified: Boolean(data.alreadyVerified),
    resent: Boolean(data.resent),
  };
}

/**
 * Fetches dynamic queue position and the verified user's referral link.
 * Upstream endpoint: GET /api/waitlist/position?code={code}
 */
export async function fetchWaitlistPosition(
  code: string
): Promise<WaitlistPositionResponse> {
  const trimmedCode = code.trim();
  if (!trimmedCode) {
    throw new Error("Referral code is required.");
  }

  const apiBase = getApiBase();

  // If in dev mode and no backend URL is set, return mock position for previewing UI
  if (import.meta.env.DEV && !apiBase) {
    console.warn(
      "[Waitlist Dev Simulation] VITE_WAITLIST_API_URL not set. Returning mock rank in development."
    );
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      position: 42,
      referralCount: 2,
      referralLink: `${window.location.origin}/?ref=${encodeURIComponent(trimmedCode)}`,
    };
  }

  const endpoint = `${apiBase}/api/waitlist/position?code=${encodeURIComponent(trimmedCode)}`;

  let response: Response;
  try {
    response = await fetch(endpoint);
  } catch (netErr: unknown) {
    const msg = netErr instanceof Error ? netErr.message : "Network error";
    console.error("[Waitlist Network Error]", netErr);
    throw new Error(`Unable to connect to the waitlist service (${msg}).`);
  }

  let data: (WaitlistPositionResponse & WaitlistApiErrorResponse) | null = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        data?.error || "User not found or not verified yet. Please check your verification email."
      );
    }
    if (response.status === 429) {
      throw new Error(
        data?.error || "Too many rank lookup requests. Please wait a moment."
      );
    }
    throw new Error(
      data?.error || data?.message || "Could not retrieve waitlist position."
    );
  }

  if (typeof data?.position !== "number" || typeof data?.referralCount !== "number") {
    throw new Error("Invalid position data received from waitlist service.");
  }

  // Construct fallback referralLink if the backend returned relative or empty link
  const publicSiteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${encodeURIComponent(trimmedCode)}`
      : `https://life-os-snowy-xi.vercel.app/?ref=${encodeURIComponent(trimmedCode)}`;

  return {
    position: data.position,
    referralCount: data.referralCount,
    referralLink: data.referralLink || publicSiteUrl,
  };
}
