import { createContext } from "react";

/**
 * Holds the authenticated user, JWT token, and auth actions.
 * Kept in its own module so the provider component and the consumer
 * hook can live in separate files (required for Fast Refresh).
 */
export const AuthContext = createContext(null);
