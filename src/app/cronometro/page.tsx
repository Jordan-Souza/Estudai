"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCcw, Play, Pause, Save, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserClient } from '@supabase/ssr';

const MOCK_SUBJECTS = ["Direito Civil", "Administrativo", "Constitucional", "Penal", "Matemática"];

export default function Cronometro() {
  const [mode, setMode] = useState<"cronometro" | "pomodoro">("cronometro");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  // Timer state
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
  };

  const handleSave = async () => {
    if (!selectedSubject) {
      alert("Selecione uma matéria antes de salvar!");
      return;
    }
    
    alert(`Sucesso (Simulado)! ${Math.floor(time / 60)} minutos salvos em ${selectedSubject}.`);
    resetTimer();
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] animate-in fade-in duration-500 pt-4 md:pt-12 pb-10">
      
      {/* Top Toggle */}
      <div className="flex bg-zinc-900/80 p-1 rounded-full border border-zinc-800/50 mb-8 backdrop-blur-sm">
        <button 
          onClick={() => setMode("cronometro")}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px]",
            mode === "cronometro" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Cronômetro
        </button>
        <button 
          onClick={() => setMode("pomodoro")}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px]",
            mode === "pomodoro" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Pomodoro
        </button>
      </div>

      {/* Seleção de Matéria */}
      <div className="mb-8 max-w-2xl w-full px-4">
        <Label className="text-xs font-semibold text-zinc-500 mb-4 block text-center uppercase tracking-widest">
          O que você vai estudar?
        </Label>
        <div className="flex flex-wrap gap-2 justify-center">
          {MOCK_SUBJECTS.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-colors border min-h-[44px]",
                selectedSubject === subject 
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20" 
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              )}
            >
              {subject}
            </button>
          ))}
          <button className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 flex items-center gap-2 bg-zinc-900/30 min-h-[44px]">
            <Plus size={16} /> Nova
          </button>
        </div>
      </div>

      {/* Bloco do Cronômetro */}
      <div className="w-full flex-1 flex flex-col items-center justify-center mt-4">
        <Card className="bg-zinc-950/50 border-zinc-800/50 shadow-2xl overflow-hidden relative w-full max-w-md rounded-3xl mx-4">
          {isRunning && (
            <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] animate-pulse rounded-full pointer-events-none" />
          )}
          
          <CardContent className="p-8 md:p-14 flex flex-col items-center relative z-10">
            <div className="text-[5rem] md:text-8xl font-mono font-light text-zinc-100 tracking-tighter tabular-nums mb-12">
              {formatTime(time)}
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-8 w-full">
              <Button 
                variant="outline" 
                size="icon"
                onClick={resetTimer}
                className="w-16 h-16 rounded-full border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80"
              >
                <RotateCcw size={24} />
              </Button>
              
              <Button 
                size="icon"
                onClick={toggleTimer}
                className={cn(
                  "w-24 h-24 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl",
                  isRunning 
                    ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20" 
                    : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20"
                )}
              >
                {isRunning ? <Pause size={36} /> : <Play size={36} className="ml-1" />}
              </Button>

              <Button 
                variant="outline" 
                size="icon"
                onClick={handleSave}
                disabled={time === 0 || isRunning}
                className="w-16 h-16 rounded-full border-indigo-500/30 bg-zinc-900 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 disabled:opacity-30 disabled:border-zinc-800 disabled:text-zinc-600 disabled:bg-transparent"
              >
                <Save size={24} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
