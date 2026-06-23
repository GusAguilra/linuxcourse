"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Terminal } from "lucide-react";

export default function Welcome() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, loading, setUsername: saveUsername } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await saveUsername(username);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
          <Terminal size={28} className="text-emerald-400" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-zinc-100">
          Bienvenido a LinuxCourse
        </h1>
        <p className="mb-8 text-sm text-zinc-500">
          Elige un nombre de usuario para empezar a aprender
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu nick (ej: linuxero42)"
            required
            minLength={2}
            maxLength={20}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-center text-lg text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
            autoFocus
          />
          <p className="text-xs text-zinc-600">
            Solo letras, números y guión bajo
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {submitting ? "Entrando..." : "Comenzar"}
          </button>
        </form>
      </div>
    </div>
  );
}
