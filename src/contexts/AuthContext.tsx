"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type Progress = {
  completedModules: string;
  currentModuleId: string | null;
  score: number;
  streak: number;
} | null;

type User = {
  id: string;
  username: string;
  progress?: Progress;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUsername: (username: string) => Promise<{ error?: string }>;
  updateUsername: (username: string) => Promise<{ error?: string }>;
  deleteAccount: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!controller.signal.aborted) setUser(data.user || null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const setUsername = useCallback(async (username: string) => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Error al crear usuario" };
      setUser(data.user);
      return {};
    } catch {
      return { error: "Error de conexión" };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
  }, []);

  const updateUsername = useCallback(async (username: string) => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Error al cambiar nombre" };
      setUser(data.user);
      return {};
    } catch {
      return { error: "Error de conexión" };
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        return { error: data.error || "Error al eliminar cuenta" };
      }
      setUser(null);
      return {};
    } catch {
      return { error: "Error de conexión" };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, setUsername, updateUsername, deleteAccount, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
