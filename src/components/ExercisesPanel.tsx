"use client";

import { useRef, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { Terminal as TerminalComponent } from "@/components/Terminal";
import type { Exercise } from "@/data/modules";

type ExercisesPanelProps = {
  exercises: Exercise[];
  completedExercises: Set<string>;
  currentExerciseIdx: number;
  onCommand: (cmd: string) => void;
};

export function ExercisesPanel({
  exercises,
  completedExercises,
  currentExerciseIdx,
  onCommand,
}: ExercisesPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentExerciseIdx === 0 || !listRef.current) return;
    const activeEl = listRef.current.querySelector(
      `[data-exercise-idx="${currentExerciseIdx}"]`
    ) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentExerciseIdx]);

  return (
    <div className="mb-8">
      <h2 className="mb-3 font-semibold text-zinc-200">Ejercicios prácticos</h2>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="content-card lg:w-1/3 overflow-y-auto lg:max-h-[350px] min-w-0">
          <div ref={listRef} role="list" aria-label="Lista de ejercicios" className="space-y-3">
            {exercises.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-600">
                No hay ejercicios para este módulo.
              </p>
            )}
            {exercises.map((ex, idx) => {
              const isDone = completedExercises.has(ex.id);
              const isActive = idx === currentExerciseIdx && !isDone;
              return (
                <div
                  key={ex.id}
                  data-exercise-idx={idx}
                  role="listitem"
                  className={`rounded-lg border p-4 transition-all ${
                    isActive
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : isDone
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="mb-2 flex items-start gap-2">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                        isDone
                          ? "bg-emerald-500 text-zinc-950"
                          : isActive
                            ? "border border-emerald-400 text-emerald-400"
                            : "border border-zinc-700 text-zinc-600"
                      }`}
                    >
                      {isDone ? <CheckCircle size={12} /> : idx + 1}
                    </span>
                    <span className="text-sm text-zinc-200">{ex.question}</span>
                  </div>
                  <div className="ml-7 flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Ejecuta:</span>
                    <code className="rounded bg-zinc-800 px-2 py-0.5 text-sm text-emerald-400">
                      {ex.command}
                    </code>
                  </div>
                  {ex.hint && isActive && (
                    <div className="ml-7 mt-2 text-xs text-zinc-600">
                      💡 {ex.hint}
                    </div>
                  )}
                  {isDone && (
                    <div className="ml-7 mt-1 text-xs text-emerald-500">Completado</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:w-2/3">
          <p className="mb-3 text-sm text-zinc-500">
            Escribe los comandos en la terminal para completar los ejercicios.
            Usa{" "}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400">help</code>{" "}
            para ver comandos disponibles.
          </p>
          <TerminalComponent height="350px" onCommand={onCommand} />
        </div>
      </div>

      {exercises.length > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2">
          <span className="text-xs text-zinc-500">
            Ejercicios completados: {completedExercises.size}/{exercises.length}
          </span>
        </div>
      )}
    </div>
  );
}
