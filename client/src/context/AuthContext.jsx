import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("cl_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading] = useState(false);

  const login = (userData, token) => {
    const payload = { ...userData, token };
    setUser(payload);
    localStorage.setItem("cl_user", JSON.stringify(payload));
    localStorage.setItem("cl_token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cl_user");
    localStorage.removeItem("cl_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);