export const SESSION_COOKIE = "scanner_session";

export function getAuthUsername() {
  return process.env.AUTH_USERNAME ?? "admin";
}

export function getAuthPassword() {
  return process.env.AUTH_PASSWORD ?? "nixon";
}

export function getSessionToken() {
  return (
    process.env.AUTH_SESSION_TOKEN ??
    "scanner-dev-session-change-in-production"
  );
}

export function verifyCredentials(username: string, password: string) {
  return (
    username === getAuthUsername() && password === getAuthPassword()
  );
}

export function isValidSession(token: string | undefined) {
  if (!token) return false;
  return token === getSessionToken();
}

export function sessionCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
