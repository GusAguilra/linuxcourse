"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { memo, useState } from "react";
import { Terminal, LogOut, User, ChevronDown } from "lucide-react";

function NavbarInner() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-mono text-sm font-semibold text-emerald-400"
        >
          <Terminal size={18} />
          linuxcourse
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                aria-label="Menú de usuario"
                aria-expanded={menuOpen}
              >
                <User size={16} />
                <span className="hidden sm:inline">{user.username}</span>
                <ChevronDown size={14} />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl sm:right-0 sm:left-auto left-0"
                    role="menu"
                  >
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                      role="menuitem"
                    >
                      Perfil
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                      role="menuitem"
                    >
                      Panel
                    </Link>
                    <hr className="my-1 border-zinc-800" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800"
                      role="menuitem"
                    >
                      <LogOut size={14} />
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/welcome"
              className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-emerald-400"
            >
              Comenzar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export const Navbar = memo(NavbarInner);
