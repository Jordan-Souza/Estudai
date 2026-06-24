import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Timer, BookOpenCheck, CalendarDays, LineChart, User } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EstudAI",
  description: "Seu SaaS de Estudos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("dark", inter.className)}>
      <body className="antialiased bg-slate-950 text-slate-50 min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900 hidden md:flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <h1 className="text-xl font-bold text-emerald-500">EstudAI</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link href="/timer" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <Timer size={20} />
              Cronômetro
            </Link>
            <Link href="/log" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <BookOpenCheck size={20} />
              Registrar Estudo
            </Link>
            <Link href="/schedule" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <CalendarDays size={20} />
              Cronograma
            </Link>
            <Link href="/performance" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <LineChart size={20} />
              Desempenho
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-6">
            <div className="md:hidden">
              <h1 className="text-xl font-bold text-emerald-500">EstudAI</h1>
            </div>
            <div className="hidden md:block">
              {/* Espaço reservado para breadcrumbs ou título da página */}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">Usuário Teste</span>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <User size={16} className="text-slate-400" />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
