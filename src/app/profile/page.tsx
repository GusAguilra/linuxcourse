"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { modules } from "@/data/modules";
import { parseCompletedModules } from "@/lib/utils";
import { resetProgress } from "@/lib/actions";
import { Terminal, User, Award, RotateCcw, Pencil, Trash2 } from "lucide-react";

export default function Profile() {
  const { user, loading, updateUsername, deleteAccount } = useAuth();
  const router = useRouter();
  const [achievements, setAchievements] = useState<{ type: string; title: string; description: string; earnedAt: string }[]>([]);

  useEffect(() => {
    if (user) {
      fetch("/api/achievements")
        .then((r) => r.json())
        .then((data) => setAchievements(data.achievements || []))
        .catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="skeleton mb-8 h-8 w-32 rounded" />
        <div className="space-y-6">
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4">
        <Terminal size={48} className="text-zinc-700" />
        <p className="text-zinc-500">Elige un nombre para empezar</p>
        <a
          href="/welcome"
          className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-zinc-950"
        >
          Comenzar
        </a>
      </div>
    );
  }

  const completedModules = parseCompletedModules(
    user.progress?.completedModules
  );

  const completedTitles = completedModules
    .map((id) => modules.find((m) => m.id === id)?.title)
    .filter(Boolean);

  const totalModules = modules.length;
  const progressPct = totalModules > 0 ? Math.round((completedModules.length / totalModules) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-8 text-2xl font-bold text-zinc-100">Perfil</h1>

      <div className="space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 font-semibold text-zinc-200">Cuenta</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={18} className="text-zinc-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-zinc-500">Usuario</div>
                <div className="truncate text-zinc-200">{user.username}</div>
              </div>
            </div>
            <ChangeNickname current={user.username} onUpdate={updateUsername} />
            <DeleteAccount onDelete={deleteAccount} />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 font-semibold text-zinc-200">
            Progreso
          </h2>
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-zinc-500">
                {completedModules.length}/{totalModules} módulos
              </span>
              <span className="text-emerald-400">{progressPct}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-zinc-800"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso de módulos"
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
              <div className="text-2xl font-bold text-zinc-100">
                {user.progress?.score || 0}
              </div>
              <div className="text-xs text-zinc-500">Puntos</div>
            </div>
            <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
              <div className="text-2xl font-bold text-zinc-100">
                {user.progress?.streak || 0}
              </div>
              <div className="text-xs text-zinc-500">Racha</div>
            </div>
            <div className="rounded-lg bg-zinc-800/50 p-3 text-center">
              <div className="text-2xl font-bold text-zinc-100">
                {completedModules.length}
              </div>
              <div className="text-xs text-zinc-500">Completados</div>
            </div>
          </div>

          {completedTitles.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-sm text-zinc-500">
                Módulos Completados
              </div>
              <div className="flex flex-wrap gap-2">
                {completedTitles.map((title) => (
                  <span
                    key={title}
                    className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400"
                  >
                    {title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {achievements.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-zinc-200">
              <Award size={18} className="text-amber-400" />
              Logros ({achievements.length})
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {achievements.map((a) => (
                <div
                  key={a.type}
                  className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3"
                >
                  <Award size={20} className="mt-0.5 shrink-0 text-amber-400" />
                  <div>
                    <div className="text-sm font-medium text-zinc-200">{a.title}</div>
                    <div className="text-xs text-zinc-500">{a.description}</div>
                    <div className="mt-1 text-[10px] text-zinc-700">
                      {new Date(a.earnedAt).toLocaleDateString("es-ES")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-zinc-800 pt-6">
          <ResetButton />
        </div>
      </div>
    </div>
  );
}

function ChangeNickname({ current, onUpdate }: { current: string; onUpdate: (name: string) => Promise<{ error?: string }> }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(current);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!editing) {
    return (
      <button
        onClick={() => { setValue(current); setEditing(true); }}
        className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <Pencil size={14} />
        Cambiar nick
      </button>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await onUpdate(value);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      setEditing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        minLength={2}
        maxLength={20}
        className="w-40 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 outline-none focus:border-emerald-500/50"
        autoFocus
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
      >
        {submitting ? "..." : "Guardar"}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-700"
      >
        Cancelar
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </form>
  );
}

function DeleteAccount({ onDelete }: { onDelete: () => Promise<{ error?: string }> }) {
  const [step, setStep] = useState<"idle" | "confirm" | "deleting">("idle");

  if (step === "deleting") {
    return <p className="text-sm text-zinc-500">Eliminando cuenta...</p>;
  }

  if (step === "confirm") {
    return (
      <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
        <p className="mb-3 text-sm text-red-400">
          ¿Estás seguro? Se eliminará tu cuenta, progreso y logros permanentemente.
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setStep("deleting");
              const result = await onDelete();
              if (!result.error) {
                window.location.href = "/welcome";
              } else {
                setStep("idle");
              }
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
          >
            Sí, eliminar
          </button>
          <button
            onClick={() => setStep("idle")}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep("confirm")}
      className="flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-red-400"
    >
      <Trash2 size={14} />
      Eliminar cuenta
    </button>
  );
}

function ResetButton() {
  const [step, setStep] = useState<"idle" | "confirm" | "resetting">("idle");
  const { refreshUser } = useAuth();

  if (step === "resetting") {
    return (
      <p className="text-sm text-zinc-500">Reiniciando progreso...</p>
    );
  }

  if (step === "confirm") {
    return (
      <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
        <p className="mb-3 text-sm text-red-400">
          ¿Estás seguro? Se borrarán todos los módulos completados, puntos, racha y logros. Tu nombre de usuario se conserva.
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setStep("resetting");
              try {
                await resetProgress();
                await refreshUser();
              } catch {
                setStep("idle");
              }
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
          >
            Sí, reiniciar
          </button>
          <button
            onClick={() => setStep("idle")}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep("confirm")}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 px-4 py-3 text-sm text-zinc-500 transition-colors hover:border-red-900/50 hover:text-red-400"
    >
      <RotateCcw size={16} />
      Reiniciar progreso
    </button>
  );
}
