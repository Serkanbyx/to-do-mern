import { useContext } from "react";
import { AuthContext } from "../context/auth-context";

/**
 * Access the auth context. Throws if used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
