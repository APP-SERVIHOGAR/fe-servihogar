import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuario = localStorage.getItem("user");
    if (token && usuario && usuario !== "undefined") {
      setIsAuthenticated(true);
      setUser(JSON.parse(usuario));
    }
  }, []);

  const login = (token, usuario) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(usuario));
    setIsAuthenticated(true);
    setUser(usuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
