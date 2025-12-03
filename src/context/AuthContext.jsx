/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(() =>
    !!localStorage.getItem("accessToken")
  );

  useEffect(() => {
    if (!initializing) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await api.get("/api/auth/me");
        if (!cancelled) setUser(res.data);
      } catch (err) {
        if (!cancelled) {
          localStorage.removeItem("accessToken");
          console.error("Failed to fetch user:", err);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initializing]);

  const login = async (username, password) => {
    const res = await api.post("/api/auth/login", { username, password });

    const { accessToken, ...userData } = res.data;
    localStorage.setItem("accessToken", accessToken);
    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, initializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;