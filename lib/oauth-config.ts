const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

/**
 * True when real Google OAuth credentials are present (not placeholders).
 * Used server-side to decide whether to register the Google provider and to
 * tell the client UI whether the "Continue with Google" button should render.
 * Secret values are never exposed here — only a boolean flag.
 */
export function isGoogleConfigured(): boolean {
  return (
    !!googleClientId &&
    !!googleClientSecret &&
    !googleClientId.startsWith("REPLACE") &&
    !googleClientSecret.startsWith("REPLACE")
  );
}