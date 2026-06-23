import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUsername } from "@/lib/auth";
import { BookOpen, Zap, ArrowRight, Award, CheckCircle, Terminal, User } from "lucide-react";
import { LandingDemo } from "@/components/LandingDemo";

export default async function Landing() {
  const username = await getSessionUsername();
  if (username) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative flex flex-1 flex-col items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-20 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative z-10 mx-auto mt-20 flex w-full max-w-6xl flex-col items-center px-6">
          <div className="text-center lg:text-left w-full">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
              <Zap size={14} />
              Aprendizaje Interactivo de Linux
            </div>

            <h1 className="mb-12 text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
              Domina Linux de
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                {" "}Cero a Avanzado
              </span>
            </h1>
          </div>

          <div className="flex w-full flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 text-center lg:text-left">
              <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-zinc-400 lg:mx-0">
                Un proyecto open source para aprender Linux con módulos,
                terminal simulada y ejercicios prácticos. Corre localmente,
                sin humo ni promesas falsas.
              </p>

              <div className="flex items-center justify-center gap-4 lg:justify-start">
                <Link
                  href="/welcome"
                  className="group flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3 font-medium text-zinc-950 transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_8px_30px_rgba(34,197,94,0.35)] active:scale-[0.98]"
                >
                  Empezar
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <BookOpen size={16} className="text-emerald-500" />
                  <span><strong className="text-zinc-300">12</strong> módulos</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Terminal size={16} className="text-emerald-500" />
                  <span><strong className="text-zinc-300">Open Source</strong> — GPL v3</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <User size={16} className="text-emerald-500" />
                  <span><strong className="text-zinc-300">Sin registro</strong> — solo un nick</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Award size={16} className="text-emerald-500" />
                  <span>Puede tener errores, el fin es <strong className="text-zinc-300">aprender</strong> y <strong className="text-zinc-300">mejorarlo juntos</strong></span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-lg">
              <LandingDemo />
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-24 w-full max-w-5xl px-6 pb-24">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-zinc-100">
              Cómo funciona
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Tu viaje de aprendizaje en tres pasos simples
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "01",
                icon: <BookOpen size={24} />,
                title: "Aprende",
                desc: "Lee contenido estructurado en módulos progresivos, desde fundamentos hasta administración avanzada del sistema.",
              },
              {
                step: "02",
                icon: <Terminal size={24} />,
                title: "Practica",
                desc: "Ejecuta comandos reales en la terminal simulada y recibe feedback inmediato sobre tus respuestas.",
              },
              {
                step: "03",
                icon: <CheckCircle size={24} />,
                title: "Domina",
                desc: "Completa ejercicios, aprueba quizzes y sigue tu progreso con estadísticas detalladas.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6 transition-all duration-300 hover:border-zinc-700/80 hover:bg-zinc-900/60 hover:-translate-y-0.5"
              >
                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, transparent 50%)",
                  }}
                />
                <div className="relative">
                  <span className="text-[0.6rem] font-mono font-bold tracking-widest text-emerald-500/50">
                    {feature.step}
                  </span>
                  <div className="mt-4 mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-zinc-100">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="w-full border-t border-zinc-800/50 py-8 text-center text-xs text-zinc-700">
          linuxcourse — proyecto open source para aprender Linux
        </footer>
      </div>
    </div>
  );
}