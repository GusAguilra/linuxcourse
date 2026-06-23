import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LinuxCourse — Aprende Linux Interactivamente",
  description:
    "Plataforma interactiva para aprender Linux con terminal simulada, módulos estructurados y práctica hands-on.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full bg-zinc-950 font-sans text-zinc-200 antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <AuthProvider>
          <ScrollToTop />
          <Navbar />
          <Sidebar />
          <main
            id="main-content"
            className="min-h-screen pt-14 lg:pl-[var(--sidebar-width)]"
          >
            {children}
          </main>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "#18181b",
                color: "#e4e4e7",
                border: "1px solid #27272a",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
