import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Timer, BookOpenCheck, CalendarDays, LineChart, User, Trophy } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EstudAI",
  description: "SaaS Premium de Estudos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={cn(inter.className, "min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-200")}>
        
        {/* Desktop Sidebar (hidden on mobile) */}
        <aside className="hidden md:flex w-64 border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex-col h-screen sticky top-0">
          <div className="p-6 border-b border-zinc-800">
            <h1 className="text-2xl font-bold tracking-tighter text-zinc-100 flex items-center gap-2">
              <span className="text-indigo-500">◆</span> EstudAI
            </h1>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors">
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link href="/cronometro" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors">
              <Timer size={20} />
              Cronômetro
            </Link>
            <Link href="/registrar" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors">
              <BookOpenCheck size={20} />
              Registrar Estudo
            </Link>
            <Link href="/cronograma" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors">
              <CalendarDays size={20} />
              Cronograma
            </Link>
            <Link href="/desempenho" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors">
              <LineChart size={20} />
              Desempenho
            </Link>
            <Link href="/relatorio-semanal" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-500/10 text-amber-500/80 hover:text-amber-500 transition-colors mt-6 border border-transparent hover:border-amber-500/30">
              <Trophy size={20} />
              Relatório Premium
            </Link>
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Jordan</span>
                <span className="text-xs text-zinc-500">Plano Grátis</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
          <h1 className="text-xl font-bold tracking-tighter text-zinc-100 flex items-center gap-2">
            <span className="text-indigo-500">◆</span> EstudAI
          </h1>
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
            <User size={16} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 w-full bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-800 flex items-center justify-around p-2 z-50 pb-safe">
          <Link href="/" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-zinc-100 min-w-[64px] min-h-[44px]">
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-medium">Início</span>
          </Link>
          <Link href="/cronograma" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-zinc-100 min-w-[64px] min-h-[44px]">
            <CalendarDays size={24} />
            <span className="text-[10px] font-medium">Agenda</span>
          </Link>
          <Link href="/cronometro" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-zinc-100 min-w-[64px] min-h-[44px] -mt-6">
            <div className="bg-indigo-600 text-white p-3 rounded-full shadow-lg shadow-indigo-600/20">
              <Timer size={28} />
            </div>
            <span className="text-[10px] font-medium mt-1">Foco</span>
          </Link>
          <Link href="/registrar" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-zinc-100 min-w-[64px] min-h-[44px]">
            <BookOpenCheck size={24} />
            <span className="text-[10px] font-medium">Log</span>
          </Link>
          <Link href="/desempenho" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-zinc-100 min-w-[64px] min-h-[44px]">
            <LineChart size={24} />
            <span className="text-[10px] font-medium">Dados</span>
          </Link>
        </nav>
        
      </body>
    </html>
  );
}
