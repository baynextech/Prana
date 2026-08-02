import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: "alumno" | "profesor" | "admin";
  created_at: string;
}

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, name: string, role?: string) => Promise<{ error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("prana_token"));

  useEffect(() => {
    if (token) refreshProfile();
  }, []);

  const refreshProfile = async () => {
    const t = localStorage.getItem("prana_token");
    if (!t) return;
    try {
      const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
      } else {
        logout();
      }
    } catch {}
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Error al iniciar sesión" };
      const t = data.session?.access_token;
      if (t) {
        localStorage.setItem("prana_token", t);
        setToken(t);
        setUser(data.user);
        setProfile(data.profile);
      }
      return {};
    } catch {
      return { error: "Error de conexión" };
    }
  };

  const register = async (email: string, password: string, name: string, role = "alumno") => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Error al registrarse" };
      if (data.session?.access_token) {
        const t = data.session.access_token;
        localStorage.setItem("prana_token", t);
        setToken(t);
        setUser(data.user);
        await refreshProfile();
      }
      return {};
    } catch {
      return { error: "Error de conexión" };
    }
  };

  const logout = () => {
    localStorage.removeItem("prana_token");
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, token,
      login, register, logout,
      isAuthenticated: !!user,
      isAdmin: profile?.role === "admin",
      isTeacher: profile?.role === "profesor" || profile?.role === "admin",
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
