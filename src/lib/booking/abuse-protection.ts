/**
 * Server-side abuse checks before booking.
 * Turnstile can be plugged into verifyBookingAbuseProtection later
 * without changing book_appointment / createBooking flow.
 */

export type AbuseProtectionInput = {
  /** Reserved for Cloudflare Turnstile token when enabled */
  captchaToken?: string | null;
};

export type AbuseProtectionResult =
  | { ok: true }
  | { ok: false; code: "CAPTCHA_FAILED"; message: string };

/**
 * Placeholder gate for future Cloudflare Turnstile verification.
 * Currently a no-op so the booking UX stays unchanged.
 */
export async function verifyBookingAbuseProtection(
  _input: AbuseProtectionInput = {},
): Promise<AbuseProtectionResult> {
  // When Turnstile is enabled:
  // 1. Require captchaToken
  // 2. POST to https://challenges.cloudflare.com/turnstile/v0/siteverify
  // 3. Return CAPTCHA_FAILED if invalid
  return { ok: true };
}
