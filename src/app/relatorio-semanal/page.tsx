"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, CheckSquare, Square, BrainCircuit, Target, Lightbulb, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type RoadmapItem = {
  subject: string;
  topic: string;
  blind_spot: string;
  action_plan: string;
  mnemonic: string;
};

export default function RelatorioSemanal() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapItem[] | null>(null);
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});

  const handleGenerate = async () => {
    setIsGenerating(true);
    setRoadmap(null);
    try {
      const res = await fetch("/api/smart-report", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Erro desconhecido.");
      if (data.message) {
        toast.success(data.message);
        setRoadmap([]);
      } else {
        setRoadmap(data.roadmap);
      }
    } catch (err: any) {
      toast.error("Erro ao gerar relatório", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCheck = (index: number) => {
    setCheckedActions(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const loadingPhrases = [
    "Analisando seus pontos cegos...",
    "Cruzando jurisprudências...",
    "Construindo roadmap definitivo...",
    "Buscando as falhas mais recorrentes..."
  ];

  const randomPhrase = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            Relatório Inteligente
            <Sparkles className="text-indigo-400 h-6 w-6" />
          </h2>
          <p className="text-zinc-400 mt-2">
            Sua IA pessoal que destrincha a semana e cria um plano de ação para erradicar seus pontos cegos.
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 border-0 h-12 px-6 rounded-xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <BrainCircuit className="mr-2 h-5 w-5" />
          {isGenerating ? "Gerando..." : "Gerar Relatório da Semana"}
        </Button>
      </div>

      {isGenerating && (
        <div className="space-y-6 pt-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 text-indigo-400">
            <BrainCircuit className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium animate-pulse">{randomPhrase}</span>
          </div>
          {[1, 2].map(i => (
            <Card key={i} className="bg-zinc-900 border-zinc-800/50 rounded-2xl overflow-hidden">
              <CardHeader className="bg-zinc-800/20 pb-4 border-b border-zinc-800/50">
                <Skeleton className="h-6 w-1/3 bg-zinc-800" />
                <Skeleton className="h-4 w-1/4 bg-zinc-800 mt-2" />
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-zinc-800" />
                  <Skeleton className="h-16 w-full bg-zinc-800/50 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-zinc-800" />
                  <Skeleton className="h-12 w-full bg-zinc-800/50 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isGenerating && roadmap !== null && roadmap.length === 0 && (
        <Card className="bg-emerald-500/10 border-emerald-500/20 rounded-2xl">
          <CardContent className="flex flex-col items-center text-center p-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
              <Target className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Impecável!</h3>
            <p className="text-emerald-500/80 max-w-md">
              Você não cometeu erros repetidos nos últimos 7 dias. Seu desempenho nas questões inéditas está excelente.
            </p>
          </CardContent>
        </Card>
      )}

      {!isGenerating && roadmap && roadmap.length > 0 && (
        <div className="space-y-6 pt-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px bg-zinc-800 flex-1" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-2">Roadmap de Correção</span>
            <div className="h-px bg-zinc-800 flex-1" />
          </div>

          {roadmap.map((item, idx) => (
            <Card key={idx} className="bg-zinc-900 border-zinc-800/50 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
              <CardHeader className="bg-zinc-800/20 pb-4 border-b border-zinc-800/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">{item.subject}</p>
                    <CardTitle className="text-xl text-zinc-100">{item.topic}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                
                {/* Ponto Cego */}
                <div className="p-6 border-b border-zinc-800/50 bg-red-500/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-400 h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-400 mb-1">Ponto Cego (O que você errou)</h4>
                      <p className="text-zinc-300 leading-relaxed text-sm">{item.blind_spot}</p>
                    </div>
                  </div>
                </div>

                {/* Checklist de Ação */}
                <div className="p-6 border-b border-zinc-800/50">
                  <h4 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4" /> Plano de Ação Imediato
                  </h4>
                  <button 
                    onClick={() => toggleCheck(idx)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 group",
                      checkedActions[idx] 
                        ? "bg-emerald-500/10 border-emerald-500/30" 
                        : "bg-zinc-950/50 border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    {checkedActions[idx] ? (
                      <CheckSquare className="text-emerald-500 h-5 w-5 shrink-0 transition-transform scale-110" />
                    ) : (
                      <Square className="text-zinc-600 group-hover:text-zinc-500 h-5 w-5 shrink-0 transition-colors" />
                    )}
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      checkedActions[idx] ? "text-emerald-400/80 line-through" : "text-zinc-200"
                    )}>
                      {item.action_plan}
                    </span>
                  </button>
                </div>

                {/* Mnemônico */}
                <div className="p-6 bg-amber-500/5">
                  <div className="flex gap-4 items-start p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 shadow-inner">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                      <Lightbulb className="text-amber-500 h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Mnemônico / Gatilho Mental</h4>
                      <p className="text-amber-500/90 font-medium leading-relaxed">{item.mnemonic}</p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
