"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { parseCompletedModules } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  Zap,
  ArrowRight,
  Terminal,
  Flame,
  BookOpen,
  Trophy,
  ChevronRight,
} from "lucide-react";
import type { ServerModule } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressRing } from "@/components/ui/Progress";
import { Section, Container, Grid } from "@/components/ui/Section";
import { MetricCard } from "@/components/ui/StatCard";
import { cn } from "@/lib/utils";

type DashboardClientProps = {
  initialModules: ServerModule[];
};

const categoryIcons: Record<string, React.ReactNode> = {
  Fundamentos: <BookOpen size={16} />,
  "Administración del Sistema": <Terminal size={16} />,
  "Gestión de Paquetes": <Zap size={16} />,
  Almacenamiento: <Terminal size={16} />,
  Redes: <Terminal size={16} />,
  Scripting: <BookOpen size={16} />,
  Seguridad: <Trophy size={16} />,
};

function useCountUp(end: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [end, duration]);

  return value;
}

export function DashboardClient({ initialModules }: DashboardClientProps) {
  const { user, loading } = useAuth();
  const [modules] = useState(initialModules);

  const score = user?.progress?.score || 0;
  const streak = user?.progress?.streak || 0;
  const completedModules = parseCompletedModules(user?.progress?.completedModules || "[]");
  const totalModules = modules.length;
  const completed = completedModules.length;
  const progressPct = totalModules > 0 ? Math.round((completed / totalModules) * 100) : 0;

  const animatedScore = useCountUp(score, 1200);
  const animatedProgress = useCountUp(progressPct, 1000);
  const animatedCompleted = useCountUp(completed, 800);

  if (loading) {
    return (
      <Container size="md">
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="skeleton h-8 w-72 rounded-lg" />
            <div className="skeleton h-4 w-48 rounded-lg" />
          </div>
          <Grid cols={1} colsSm={2} colsMd={4} gap="md">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </Grid>
          <div className="skeleton h-44 rounded-2xl" />
          <Grid cols={1} colsSm={2} colsMd={3} gap="md">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </Grid>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container size="md">
        <div className="flex min-h-[60vh] items-center justify-center py-16">
          <Card variant="glass" padding="lg" className="text-center max-w-sm">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <Terminal size={40} className="text-zinc-700" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-zinc-100">Elige un nombre para empezar</h3>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">Necesitas un usuario para seguir tu progreso en la plataforma.</p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/welcome"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-zinc-950 transition-all hover:bg-emerald-400"
              >
                Comenzar
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  const nextModule = modules.find((m) => !completedModules.includes(m.id));
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <Container size="lg" className="py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">{user.username}</h1>
            {streak >= 7 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400 border border-amber-500/20">
                <Flame size={12} /> Racha activa
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-zinc-500">
            Continúa tu viaje de aprendizaje de Linux
          </p>
        </div>
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-100 transition-all duration-180 ease-out hover:bg-zinc-800 hover:border-zinc-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          <Terminal size={14} />
          Práctica libre
        </Link>
      </div>

      <Grid cols={2} colsSm={2} colsMd={4} gap="md" className="mb-8">
        <MetricCard
          label="Progreso"
          value={`${animatedProgress}%`}
          sub={`${completed}/${totalModules} módulos`}
          accentColor={progressPct === 100 ? "emerald" : progressPct > 50 ? "amber" : "emerald"}
          icon={<ProgressRing value={progressPct} size={36} strokeWidth={3} showLabel={false} />}
        />
        <MetricCard
          label="Puntos"
          value={animatedScore.toLocaleString()}
          sub="puntos totales"
          accentColor="amber"
          icon={<Zap size={18} className="text-amber-400" />}
        />
        <MetricCard
          label="Racha"
          value={`${streak} días`}
          sub={streak >= 7 ? "Sigue así! 🔥" : "sigue practicando"}
          accentColor={streak >= 7 ? "rose" : "blue"}
          icon={<Flame size={18} className={streak >= 7 ? "text-rose-400" : "text-blue-400"} />}
        />
        <MetricCard
          label="Completados"
          value={`${animatedCompleted}`}
          sub={`${totalModules - completed} restantes`}
          accentColor={completed === totalModules ? "emerald" : "cyan"}
          icon={<CheckCircle size={18} className={completed === totalModules ? "text-emerald-400" : "text-cyan-400"} />}
        />
      </Grid>

      {nextModule && (
        <Card variant="brand" padding="md" className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <BookOpen size={18} className="text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.65rem] font-medium uppercase tracking-wider text-emerald-400">
                  Siguiente módulo
                </p>
                <p className="mt-0.5 truncate text-base font-semibold text-zinc-100">{nextModule.title}</p>
                <p className="truncate text-sm text-zinc-500">{nextModule.description}</p>
              </div>
            </div>
            <Link
              href={`/modules/${nextModule.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-zinc-950 transition-all duration-180 ease-out hover:bg-emerald-400 active:scale-[0.98] shadow-[0_4px_14px_rgba(34,197,94,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              Empezar <ArrowRight size={14} />
            </Link>
          </div>
        </Card>
      )}

      <Section title="Todos los módulos" description={`${completed}/${totalModules} completados`}>
        <Grid cols={1} colsSm={2} colsMd={3} gap="md">
          {sortedModules.map((mod) => {
            const isCompleted = completedModules.includes(mod.id);
            const isFirstIncomplete = mod.id === nextModule?.id;
            const isLocked = !isCompleted && !isFirstIncomplete && !sortedModules.slice(0, sortedModules.indexOf(mod)).every(m => completedModules.includes(m.id) || !m.id);

            return (
              <Link key={mod.id} href={isLocked ? "#" : `/modules/${mod.slug}`} className="block">
                <Card
                  variant={isCompleted ? "default" : isFirstIncomplete ? "brand" : "default"}
                  padding="md"
                  hover={!isLocked}
                  className={cn(
                    "h-full relative overflow-hidden",
                    isLocked && "opacity-50 cursor-not-allowed",
                    isFirstIncomplete && "ring-1 ring-emerald-500/30"
                  )}
                >
                  {isFirstIncomplete && (
                    <div className="absolute top-0 right-0 w-24 h-24 translate-x-8 -translate-y-8 bg-emerald-500/10 rounded-full blur-2xl" />
                  )}

                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                      isCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      isFirstIncomplete ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" :
                      "bg-zinc-800/50 border-zinc-700 text-zinc-500"
                    )}>
                      {isCompleted ? <CheckCircle size={16} /> : categoryIcons[mod.category] || <BookOpen size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={isCompleted ? "success" : isFirstIncomplete ? "brand" : "default"} size="sm">
                          {isCompleted ? "Completado" : isFirstIncomplete ? "Siguiente" : `Módulo ${mod.order}`}
                        </Badge>
                      </div>
                      <h3 className={cn(
                        "mt-1.5 font-semibold text-sm truncate",
                        isCompleted ? "text-emerald-200" : "text-zinc-100"
                      )}>
                        {mod.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{mod.description}</p>

                  <div className="flex items-center justify-between border-t border-zinc-800/50 pt-3 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.65rem] text-zinc-600">{mod.exercises} ejercicios</span>
                      <span className="text-[0.65rem] text-zinc-700">·</span>
                      <span className="text-[0.65rem] text-zinc-600">{mod.category}</span>
                    </div>
                    {!isLocked && (
                      <ChevronRight size={14} className={cn(
                        "shrink-0 transition-all",
                        isCompleted ? "text-emerald-500" : "text-zinc-600"
                      )} />
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </Grid>
      </Section>

      <div className="mt-12 border-t border-zinc-800/50 pt-8">
        <div className="flex items-center justify-center gap-8 text-xs text-zinc-700">
          <span className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
            Completado
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Siguiente
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
            Disponible
          </span>
        </div>
      </div>
    </Container>
  );
}

