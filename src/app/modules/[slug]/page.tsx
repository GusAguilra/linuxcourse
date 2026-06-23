"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ExercisesPanel } from "@/components/ExercisesPanel";
import { Quiz } from "@/components/Quiz";
import { TableOfContents } from "@/components/TableOfContents";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Section";
import { parseCompletedModules } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { modules, type Module } from "@/data/modules";
import toast from "react-hot-toast";

export default function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <ModulePageInner key={slug} slug={slug} />;
}

function ModulePageInner({ slug }: { slug: string }) {
  const [mod, setMod] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const { user, refreshUser } = useAuth();

  const completedModules = user ? parseCompletedModules(user.progress?.completedModules) : [];
  const completed = mod ? completedModules.includes(mod.id) : false;
  const nextMod = mod ? modules.find((m) => m.order === mod.order + 1) : null;

  useEffect(() => {
    const cancelled = { current: false };
    fetch(`/api/modules/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled.current) {
          setMod(data.module);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled.current) setLoading(false); });
    return () => { cancelled.current = true; };
  }, [slug]);

  const handleCommand = useCallback(
    (cmd: string) => {
      if (!mod) return;
      const normalized = cmd.trim().replace(/\s+/g, " ");
      const matchedIdx = mod.exercises.findIndex(
        (e) =>
          !completedExercises.has(e.id) &&
          e.command.replace(/\s+/g, " ") === normalized
      );
      if (matchedIdx !== -1) {
        const ex = mod.exercises[matchedIdx];
        setCompletedExercises((prev) => {
          const next = new Set(prev);
          next.add(ex.id);
          return next;
        });
        setCurrentExerciseIdx((prev) =>
          matchedIdx + 1 < mod.exercises.length ? matchedIdx + 1 : prev
        );
        toast.success(`Ejercicio "${ex.question}" completado!`, {
          duration: 3000,
        });
      }
    },
    [mod, completedExercises]
  );

  const handleComplete = useCallback(async () => {
    await refreshUser();
  }, [refreshUser]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6 space-y-3">
          <div className="skeleton h-4 w-48 rounded" />
          <div className="skeleton h-8 w-96 rounded" />
          <div className="skeleton h-4 w-64 rounded" />
        </div>
        <div className="skeleton mb-8 h-[400px] rounded-xl" />
        <div className="skeleton h-48 rounded-xl" />
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Módulo no encontrado</p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950"
        >
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Container size="lg" className="py-8">
        <div className="flex gap-8">
          <div className="min-w-0 flex-1">
            <div className="mb-8">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-lg bg-zinc-800 px-2.5 py-0.5 text-[0.65rem] font-medium text-zinc-500 uppercase tracking-wider">
                  Módulo {mod.order}
                </span>
                <span className="text-[0.65rem] text-zinc-700">·</span>
                <span className="text-[0.65rem] text-zinc-500">{mod.category}</span>
                {completed && (
                  <>
                    <span className="text-[0.65rem] text-zinc-700">·</span>
                    <span className="flex items-center gap-1 text-[0.65rem] text-emerald-400">
                      <CheckCircle size={10} /> Completado
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">{mod.title}</h1>
              <p className="mt-2 text-base text-zinc-500 leading-relaxed max-w-2xl">{mod.description}</p>
            </div>

            <Card variant="default" padding="lg" className="mb-8 overflow-visible">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: mod.content ?? "",
                }}
              />
            </Card>

            <ExercisesPanel
              exercises={mod.exercises}
              completedExercises={completedExercises}
              currentExerciseIdx={currentExerciseIdx}
              onCommand={handleCommand}
            />

            <div className="mt-8">
              <Quiz
                quiz={mod.quiz}
                moduleId={mod.id}
                completed={completed}
                onComplete={handleComplete}
              />
            </div>

            {completed && (
              <div className="mt-8 flex justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-5 py-2.5 text-sm font-medium text-zinc-100 transition-all hover:bg-zinc-800 hover:border-zinc-600 active:scale-[0.98]"
                >
                  Volver al panel
                </Link>
                {nextMod && (
                  <Link
                    href={`/modules/${nextMod.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.98] shadow-[0_4px_14px_rgba(34,197,94,0.25)]"
                  >
                    Siguiente módulo
                  </Link>
                )}
              </div>
            )}
          </div>

          <TableOfContents />
        </div>
      </Container>
    </ErrorBoundary>
  );
}
