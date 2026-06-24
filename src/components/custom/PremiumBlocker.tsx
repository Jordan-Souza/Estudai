import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PremiumBlocker({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30">
      
      {/* O Conteúdo Original */}
      <div className="opacity-20 pointer-events-none select-none filter blur-[5px]">
        {children}
      </div>

      {/* Overlay Premium */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/40 backdrop-blur-md">
        <div className="bg-zinc-900/90 border border-amber-500/30 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6 ring-1 ring-amber-500/30">
            <Lock size={32} />
          </div>
          <h3 className="text-xl font-bold text-zinc-100 mb-2">Recurso Premium</h3>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
            Desbloqueie relatórios avançados, histórico ilimitado, inteligência artificial e conquistas exclusivas para acelerar seus estudos.
          </p>
          <Button className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl h-12">
            Desbloquear Acesso
          </Button>
        </div>
      </div>
    </div>
  );
}
