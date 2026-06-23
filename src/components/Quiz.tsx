"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import { completeModule } from "@/lib/actions";
import type { QuizQuestion } from "@/data/modules";

type QuizProps = {
  quiz: QuizQuestion[];
  moduleId: string;
  completed: boolean;
  onComplete: () => void;
};

export function Quiz({ quiz, moduleId, completed, onComplete }: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [pointsLockedOut, setPointsLockedOut] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!cooldownUntil) return;
    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownRemaining(remaining);
      if (remaining === 0) setCooldownUntil(null);
    };
    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(interval);
  }, [cooldownUntil]);

  const handleSubmit = useCallback(async () => {
    if (cooldownUntil) return;
    let correct = 0;
    quiz.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    setScore(correct);
    setSubmitted(true);

    if (correct >= 12) {
      setCompleting(true);
      const points = pointsLockedOut
        ? 0
        : Math.max(30, correct * 10 - failedAttempts * 10);
      try {
        await completeModule(moduleId, points);
        onComplete();
      } catch {}
      setCompleting(false);
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed > 3) setPointsLockedOut(true);
      if (nextFailed % 3 === 0) setCooldownUntil(Date.now() + 60_000);
    }
  }, [quiz, answers, failedAttempts, cooldownUntil, pointsLockedOut, moduleId, onComplete]);

  const availablePoints = pointsLockedOut
    ? 0
    : Math.max(30, quiz.length * 10 - failedAttempts * 10);

  return (
    <div className="content-card">
      <div className="mb-4 flex items-center gap-2">
        <CheckCircle size={18} className="text-amber-400" />
        <span className="font-semibold text-zinc-200">
          Cuestionario ({quiz.length} preguntas)
        </span>
        {completed && (
          <span className="ml-auto text-xs text-emerald-400">Completado</span>
        )}
      </div>

      <div className="space-y-6">
        {quiz.length > 0 && !completed && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-400">
            <span>
              Puntos máximos: {availablePoints}/{quiz.length * 10} · Aprobación: 12/{quiz.length}
            </span>
            {failedAttempts > 0 && (
              <span className="ml-2 text-amber-400">
                ({failedAttempts} intento{failedAttempts === 1 ? "" : "s"} fallido{failedAttempts === 1 ? "" : "s"})
              </span>
            )}
            {cooldownRemaining > 0 && (
              <div className="mt-2 text-red-400">
                Cuestionario bloqueado por {cooldownRemaining}s. Repasa el material antes de intentar de nuevo.
              </div>
            )}
            {pointsLockedOut && (
              <div className="mt-2 text-red-400">
                Ya no hay puntos disponibles para este módulo. Aún debes aprobarlo para avanzar.
              </div>
            )}
          </div>
        )}

        {quiz.length === 0 && (
          <p className="text-sm text-zinc-600">No hay cuestionario para este módulo.</p>
        )}

        {quiz.map((q, idx) => (
          <div key={q.id}>
            <div className="mb-3 text-sm font-medium text-zinc-200">
              {idx + 1}. {q.question}
            </div>
            <div className="space-y-2" role="radiogroup" aria-label={`Pregunta ${idx + 1}`}>
              {q.options.map((opt, optIdx) => {
                const selected = answers[q.id] === optIdx;
                const isCorrect = submitted && optIdx === q.correctIndex;
                const isWrong = submitted && selected && optIdx !== q.correctIndex;

                return (
                  <button
                    key={optIdx}
                    onClick={() => {
                      if (!submitted) {
                        setAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                      }
                    }}
                    disabled={submitted}
                    role="radio"
                    aria-checked={selected}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                      submitted
                        ? isCorrect
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : isWrong
                            ? "border-red-500/30 bg-red-500/10 text-red-400"
                            : "border-zinc-800 text-zinc-500"
                        : selected
                          ? "border-emerald-500/30 bg-emerald-500/5 text-zinc-200"
                          : "border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                        submitted
                          ? isCorrect
                            ? "border-emerald-400 bg-emerald-400 text-zinc-950"
                            : isWrong
                              ? "border-red-400 bg-red-400 text-zinc-950"
                              : "border-zinc-700"
                          : selected
                            ? "border-emerald-400 bg-emerald-400 text-zinc-950"
                            : "border-zinc-700"
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="mt-2 text-xs text-zinc-500">{q.explanation}</div>
            )}
          </div>
        ))}

        {!submitted && quiz.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < quiz.length}
            className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {completing ? "Completando..." : "Enviar respuestas"}
          </button>
        )}

        {submitted && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 text-center">
            <div className="text-2xl font-bold text-zinc-100">
              {score}/{quiz.length}
            </div>
            <div className="mt-1 text-sm text-zinc-500">
              {score >= 12
                ? `¡Aprobado! Puntuación: ${score}/${quiz.length}. Recibiste ${Math.max(30, score * 10 - failedAttempts * 10)} puntos.`
                : "Repasa el material e inténtalo de nuevo."}
            </div>
            {score < 12 && !completed && (
              <button
                onClick={() => {
                  setSubmitted(false);
                  setAnswers({});
                }}
                disabled={cooldownRemaining > 0}
                className="mt-3 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cooldownRemaining > 0
                  ? `Disponible en ${cooldownRemaining}s`
                  : "Intentar de nuevo"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
