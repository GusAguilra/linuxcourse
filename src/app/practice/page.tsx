"use client";

import { useState, useEffect, useCallback } from "react";
import { Terminal as TerminalComponent } from "@/components/Terminal";
import { Terminal, Shuffle, ArrowRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type ExerciseWithModule = {
  id: string;
  question: string;
  command: string;
  expectedOutput?: string;
  hint?: string;
  module: string;
  moduleSlug: string;
};

export default function Practice() {
  const [mode, setMode] = useState<"free" | "challenge">("free");
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [allExercises, setAllExercises] = useState<ExerciseWithModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/modules")
      .then((res) => res.json())
      .then((data) => {
        const exercises = (data.modules || []).flatMap(
          (m: { title: string; slug: string; exercises: ExerciseWithModule[] }) =>
            m.exercises.map((e) => ({
              ...e,
              module: m.title,
              moduleSlug: m.slug,
            }))
        );
        setAllExercises(exercises);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const challenge = allExercises[currentChallenge];

  const nextChallenge = useCallback(() => {
    setCurrentChallenge((prev) =>
      prev < allExercises.length - 1 ? prev + 1 : 0
    );
  }, [allExercises.length]);

  const shuffleChallenge = useCallback(() => {
    setCurrentChallenge(Math.floor(Math.random() * allExercises.length));
  }, [allExercises.length]);

  const handleCommand = useCallback(
    (cmd: string) => {
      if (!challenge) return;
      const normalized = cmd.trim().replace(/\s+/g, " ");
      const expected = challenge.command.replace(/\s+/g, " ");
      if (normalized === expected) {
        toast.success("¡Desafío completado!");
      }
    },
    [challenge]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6 space-y-3">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-4 w-72 rounded" />
        </div>
        <div className="mb-6 flex gap-3">
          <div className="skeleton h-10 w-40 rounded-xl" />
          <div className="skeleton h-10 w-40 rounded-xl" />
        </div>
        <div className="skeleton h-[450px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Modo Práctica</h1>
        <p className="mt-1 text-zinc-500">
          Practica comandos en la terminal libre o acepta desafíos
        </p>
      </div>

      <div className="mb-6 flex gap-3" role="tablist" aria-label="Modo de práctica">
        <button
          onClick={() => setMode("free")}
          role="tab"
          aria-selected={mode === "free"}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            mode === "free"
              ? "bg-emerald-500 text-zinc-950"
              : "border border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:bg-zinc-900/60"
          }`}
        >
          <Terminal size={16} />
          Terminal Libre
        </button>
        <button
          onClick={() => setMode("challenge")}
          role="tab"
          aria-selected={mode === "challenge"}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            mode === "challenge"
              ? "bg-emerald-500 text-zinc-950"
              : "border border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:bg-zinc-900/60"
          }`}
        >
          <Shuffle size={16} />
          Modo Desafío
        </button>
      </div>

      {mode === "free" && (
        <div>
          <p className="mb-3 text-sm text-zinc-400">
            Usa la terminal para practicar cualquier comando de Linux. Escribe{" "}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400">
              help
            </code>{" "}
            para ver los comandos disponibles.
          </p>
          <TerminalComponent height="450px" />
        </div>
      )}

      {mode === "challenge" && challenge && (
        <div>
          <div className="content-card mb-4">
            <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-zinc-500">
                Desafío {currentChallenge + 1} de {allExercises.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={shuffleChallenge}
                    className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-900/60 transition-colors"
                >
                  <Shuffle size={12} /> Aleatorio
                </button>
                <button
                  onClick={nextChallenge}
                    className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-900/60 transition-colors"
                >
                  Siguiente <ArrowRight size={12} />
                </button>
              </div>
            </div>
            <div className="mb-2 text-sm text-zinc-200">
              {challenge.question}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-600">
                De: {challenge.module}
              </span>
              <Link
                href={`/modules/${challenge.moduleSlug}`}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Ver módulo →
              </Link>
            </div>
            {challenge.hint && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-zinc-600 hover:text-zinc-400">
                  Pista
                </summary>
                <div className="mt-1 text-xs text-zinc-500">
                  {challenge.hint}
                </div>
              </details>
            )}
          </div>

          <TerminalComponent height="350px" onCommand={handleCommand} />
        </div>
      )}
    </div>
  );
}
