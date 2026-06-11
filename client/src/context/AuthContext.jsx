import { useState, useMemo, useCallback, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { AUTH_LOGOUT_EVENT, isTokenExpired } from "../utils/token";
import { AuthContext } from "./auth-context";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Reads a still-valid token from storage; clears stale auth data otherwise.
const getValidStoredToken = () => {
  const stored = localStorage.getItem("token");
  if (isTokenExpired(stored)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
  return stored;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getValidStoredToken);
  const [user, setUser] = useState(() => (token ? getStoredUser() : null));

  const persistAuth = useCallback((userData, jwtToken) => {
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  }, []);

  const register = useCallback(
    async (name, email, password) => {
      const { data } = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
      });
      persistAuth(data.user, data.token);
      return data;
    },
    [persistAuth],
  );

  const login = useCallback(
    async (email, password) => {
      const { data } = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      persistAuth(data.user, data.token);
      return data;
    },
    [persistAuth],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  // React to session-expiry events emitted by the Axios interceptor.
  // Clearing state lets ProtectedRoute redirect via the router instead
  // of forcing a full-page reload.
  useEffect(() => {
    const handleLogout = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
