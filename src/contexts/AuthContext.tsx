import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  name: string;
  email: string;
  role: "alumno" | "profesor" | "instituto";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string, role?: "alumno" | "profesor" | "instituto") => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('prana_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, name?: string, role?: "alumno" | "profesor" | "instituto") => {
    const resolvedRole = role || "alumno";
    const newUser: User = { 
      name: name || email.split('@')[0], 
      email,
      role: resolvedRole
    };
    setUser(newUser);
    localStorage.setItem('prana_user', JSON.stringify(newUser));

    // Sincronizar con el backend
    fetch("/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newUser.name,
        email: newUser.email,
        role: resolvedRole
      })
    }).catch(err => console.error("Error syncing profile with server:", err));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('prana_user');
  };

  // Sincronizar entre pestañas
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return context;
};
