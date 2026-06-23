"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { parseCompletedModules } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { memo, useState, useEffect } from "react";
import {
  BookOpen,
  Terminal,
  FileCode,
  Server,
  Package,
  HardDrive,
  Network,
  Shield,
  Menu,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

type ModuleInfo = {
  id: string;
  slug: string;
  title: string;
  category: string;
  order?: number;
};

const categoryIcons: Record<string, ReactNode> = {
  Fundamentos: <BookOpen size={16} />,
  "Administración del Sistema": <Server size={16} />,
  "Gestión de Paquetes": <Package size={16} />,
  Almacenamiento: <HardDrive size={16} />,
  Redes: <Network size={16} />,
  Scripting: <FileCode size={16} />,
  Seguridad: <Shield size={16} />,
};

function SidebarInner() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [modulesLoading, setModulesLoading] = useState(true);

  useEffect(() => {
    fetch("/api/modules")
      .then((res) => res.json())
      .then((data) => {
        const mods = (data.modules || []).map(
          (m: { id: string; slug: string; title: string; category: string; order?: number }) => ({
            id: m.id,
            slug: m.slug,
            title: m.title,
            category: m.category,
            order: m.order,
          })
        );
        setModules(mods);
        setModulesLoading(false);
      })
      .catch(() => setModulesLoading(false));
  }, []);

  const completedModules = parseCompletedModules(user?.progress?.completedModules);
  const categories = [...new Set(modules.map((m) => m.category))];

  const sidebarContent = user ? (
    <nav className="space-y-1" aria-label="Navegación principal">
      <Link
        href="/dashboard"
        onClick={() => setOpen(false)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        <Server size={16} />
        Panel
      </Link>

      <Link
        href="/practice"
        onClick={() => setOpen(false)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        <Terminal size={16} />
        Práctica
      </Link>

      <div className="my-3 border-t border-zinc-800" />

      {modulesLoading ? (
        <div className="space-y-2 px-3" aria-busy="true" aria-label="Cargando módulos">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 skeleton rounded" />
          ))}
        </div>
      ) : (
        categories.map((category) => (
          <div key={category} className="mb-2">
            <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-600">
              {categoryIcons[category] || <FileCode size={16} />}
              {category}
            </div>
            {modules
              .filter((m) => m.category === category)
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((mod) => {
                const isActive = pathname === `/modules/${mod.slug}`;
                const isCompleted = completedModules.includes(mod.id);
                return (
                  <Link
                    key={mod.id}
                    href={`/modules/${mod.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      window.scrollTo(0, 0);
                      router.push(`/modules/${mod.slug}`);
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isCompleted ? "bg-emerald-400" : "bg-zinc-700"
                      }`}
                    />
                    <span className="truncate">{mod.title}</span>
                  </Link>
                );
              })}
          </div>
        ))
      )}
    </nav>
  ) : null;

  return (
    <>
      {user && (
        <button
          onClick={() => setOpen(!open)}
          className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-xl lg:hidden"
          aria-label={open ? "Cerrar menú lateral" : "Abrir menú lateral"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-14 bottom-0 z-40 w-[var(--sidebar-width)] overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-4 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        aria-label="Ruta de aprendizaje"
        aria-hidden={!user ? true : undefined}
      >
        {user && (
          <>
            <div className="mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Terminal size={16} className="text-emerald-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Ruta de Aprendizaje
              </span>
            </div>
            {sidebarContent}
          </>
        )}
      </aside>
    </>
  );
}

export const Sidebar = memo(SidebarInner);
