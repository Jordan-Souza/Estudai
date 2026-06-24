"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MOCK_SUBJECTS = ["Direito Civil", "Administrativo", "Constitucional", "Penal", "Matemática"];

const DAYS_OF_WEEK = [
  { id: 1, name: "SEG", fullName: "Segunda" },
  { id: 2, name: "TER", fullName: "Terça" },
  { id: 3, name: "QUA", fullName: "Quarta" },
  { id: 4, name: "QUI", fullName: "Quinta" },
  { id: 5, name: "SEX", fullName: "Sexta" },
  { id: 6, name: "SÁB", fullName: "Sábado" },
  { id: 0, name: "DOM", fullName: "Domingo" },
];

export default function Cronograma() {
  const currentDayIndex = new Date().getDay(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayToAdd, setSelectedDayToAdd] = useState<{id: number, name: string} | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");

  const handleOpenModal = (dayId: number, dayName: string) => {
    setSelectedDayToAdd({ id: dayId, name: dayName });
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!selectedSubject || !selectedDayToAdd) return;
    alert(`Tarefa simulada! ${selectedSubject} adicionada para ${selectedDayToAdd.name}.`);
    setIsModalOpen(false);
    setSelectedSubject("");
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Cronograma</h2>
          <p className="text-zinc-400">Planeje sua semana de estudos</p>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 min-h-[44px] min-w-[44px]">
            <ChevronLeft size={18} />
          </Button>
          <span className="text-sm font-medium text-zinc-200 px-2 whitespace-nowrap">
            22 Jun - 28 Jun
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 min-h-[44px] min-w-[44px]">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Kanban Board - Mobile Responsive (Scrollable X on small screens) */}
      <div className="flex-1 w-full overflow-x-auto pb-6">
        <div className="flex lg:grid lg:grid-cols-7 gap-4 min-w-[800px] lg:min-w-0 h-full">
          {DAYS_OF_WEEK.map((day) => {
            const isToday = day.id === currentDayIndex;
            return (
              <div 
                key={day.id} 
                className={cn(
                  "flex flex-col flex-1 rounded-2xl border bg-zinc-900/30 overflow-hidden w-[280px] lg:w-auto h-full min-h-[400px]",
                  isToday ? "border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.1)] bg-indigo-500/5" : "border-zinc-800/50"
                )}
              >
                {/* Dia da Semana Header */}
                <div className={cn(
                  "p-3 text-center border-b font-semibold tracking-wide text-xs uppercase",
                  isToday ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-zinc-900/50 border-zinc-800/50 text-zinc-500"
                )}>
                  {day.name}
                </div>
                
                {/* Tarefas (Mocks) */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {day.id === 1 || day.id === 3 ? (
                    <Card className="bg-zinc-950 border-zinc-800/80 rounded-xl shadow-sm">
                      <CardContent className="p-3">
                        <div className="text-xs font-medium text-zinc-300">Direito Civil</div>
                      </CardContent>
                    </Card>
                  ) : null}
                  {isToday && (
                    <Card className="bg-zinc-950 border-indigo-500/30 rounded-xl shadow-sm">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="text-xs font-medium text-indigo-400">Constitucional</div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Botão Adicionar */}
                <div className="p-3 mt-auto">
                  <Button 
                    variant="outline" 
                    className="w-full border-dashed border-zinc-700 bg-transparent text-zinc-500 hover:text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/50 rounded-xl min-h-[44px]"
                    onClick={() => handleOpenModal(day.id, day.fullName)}
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frase Rodapé */}
      <div className="mt-8 text-center hidden md:block">
        <p className="text-sm text-zinc-600 italic">
          "Disciplina é a ponte entre metas e conquistas."
        </p>
      </div>

      {/* Modal Adicionar Tarefa */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-800 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 text-xl">Novo Estudo</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Agendar para <strong className="text-zinc-200">{selectedDayToAdd?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-200 rounded-xl h-12">
                <SelectValue placeholder="Selecione uma matéria..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl">
                {MOCK_SUBJECTS.map(subject => (
                  <SelectItem key={subject} value={subject} className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 rounded-lg my-1 cursor-pointer">
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 rounded-xl h-11 w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSaveTask} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-11 w-full sm:w-auto">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
