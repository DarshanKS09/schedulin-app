export const SESSION_COOKIE = "echo_session";
export const SESSION_EXPIRY_COOKIE = "echo_session_expires_at";
export const SESSION_DURATION_MINUTES = 15;
export const SESSION_DURATION_SECONDS = SESSION_DURATION_MINUTES * 60;
export const SESSION_DURATION_MS = SESSION_DURATION_SECONDS * 1000;
export const SESSION_EXPIRY_NOTICE_SECONDS = SESSION_DURATION_SECONDS + 5 * 60;
export const SESSION_EXPIRED_REDIRECT_PATH = "/auth/session-expired";

export function getSessionExpiryTimestamp(now = Date.now()) {
  return now + SESSION_DURATION_MS;
}

export function getSessionExpiredRedirectPath(nextPath = "/dashboard") {
  return `${SESSION_EXPIRED_REDIRECT_PATH}?next=${encodeURIComponent(nextPath)}`;
}
