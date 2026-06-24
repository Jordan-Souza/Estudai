"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_SUBJECTS = ["Direito Civil", "Administrativo", "Constitucional", "Penal", "Matemática"];
const RECENT_LOGS = [
  { id: 1, subject: "Direito Civil", date: "Hoje", duration: "1h 30m" },
  { id: 2, subject: "Constitucional", date: "Hoje", duration: "45m" },
  { id: 3, subject: "Administrativo", date: "Ontem", duration: "2h 00m" },
];

export default function RegistrarEstudo() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div className="text-center md:text-left mb-8 md:mb-0">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Registrar Estudo</h2>
        <p className="text-zinc-400 mt-1">
          Adicione manualmente uma sessão de estudo.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Formulário Principal (2/3) */}
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800/50 rounded-2xl shadow-sm overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-10">
            
            {/* Bloco DATA */}
            <div className="space-y-4">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">DATA</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button 
                  variant="outline" 
                  className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 rounded-xl h-12 px-6 w-full sm:w-auto"
                  onClick={() => setDate(new Date().toISOString().split('T')[0])}
                >
                  Hoje
                </Button>
                <Input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full sm:w-auto bg-zinc-950 border-zinc-800 text-zinc-200 rounded-xl h-12" 
                />
              </div>
            </div>

            {/* Bloco MATÉRIA */}
            <div className="space-y-4">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">MATÉRIA</Label>
              <div className="flex flex-wrap gap-2">
                {MOCK_SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px]",
                      selectedSubject === subject 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                        : "bg-zinc-950/50 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                    )}
                  >
                    {subject}
                  </button>
                ))}
                <button className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 flex items-center gap-2 bg-zinc-950/30 min-h-[44px]">
                  <Plus size={16} /> Nova
                </button>
              </div>
            </div>

            {/* Bloco DURAÇÃO */}
            <div className="space-y-4">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">DURAÇÃO</Label>
              <div className="flex items-center gap-2 sm:gap-4 justify-center sm:justify-start">
                <div className="flex flex-col items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="00" 
                    className="w-20 sm:w-24 h-20 sm:h-24 text-4xl sm:text-5xl font-light text-center bg-zinc-950 border-zinc-800 rounded-2xl focus-visible:ring-indigo-500"
                    min="0"
                  />
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">HORAS</span>
                </div>
                <span className="text-4xl font-light text-zinc-700 mb-6">:</span>
                <div className="flex flex-col items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="00" 
                    className="w-20 sm:w-24 h-20 sm:h-24 text-4xl sm:text-5xl font-light text-center bg-zinc-950 border-zinc-800 rounded-2xl focus-visible:ring-indigo-500"
                    min="0"
                    max="59"
                  />
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">MINUTOS</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800/50">
              <Button className="w-full h-14 rounded-xl text-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20">
                Salvar Sessão
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registros Recentes (1/3) */}
        <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl h-fit">
          <CardHeader>
            <CardTitle className="text-zinc-100">Registros Recentes</CardTitle>
            <CardDescription className="text-zinc-400">Últimas sessões salvas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {RECENT_LOGS.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-200">{log.subject}</span>
                  <span className="text-xs text-zinc-500">{log.date}</span>
                </div>
                <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{log.duration}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
