import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("lumi_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  // skinProfile is set after quiz
  const [skinProfile, setSkinProfile] = useState(() => {
    try {
      const stored = localStorage.getItem("lumi_profile");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("lumi_user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSkinProfile(null);
    localStorage.removeItem("lumi_user");
    localStorage.removeItem("lumi_profile");
  }, []);

  const saveProfile = useCallback((profile) => {
    setSkinProfile(profile);
    localStorage.setItem("lumi_profile", JSON.stringify(profile));
  }, []);

  // Quick helpers
  const userId  = user?.id  || 1;
  const userName = user?.name || "Красунечко";
  const initials = userName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AuthContext.Provider value={{ user, userId, userName, initials, skinProfile, login, logout, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
