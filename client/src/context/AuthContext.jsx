import { createContext, useContext, useState, useMemo, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

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

  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
