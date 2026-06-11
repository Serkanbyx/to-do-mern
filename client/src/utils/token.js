/**
 * Custom DOM event dispatched when the session becomes invalid
 * (e.g. the API responds with 401). AuthContext listens for this to
 * clear auth state without forcing a full page reload.
 */
export const AUTH_LOGOUT_EVENT = "auth:logout";

/**
 * Decodes a JWT payload without verifying its signature. Used purely
 * for a client-side expiry check — the server remains the source of truth.
 * @param {string} token
 * @returns {object | null}
 */
const decodeToken = (token) => {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

/**
 * Returns true when the token is missing, malformed, or past its
 * `exp` (expiry) claim.
 * @param {string | null} token
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
};
