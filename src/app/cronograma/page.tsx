"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

type Subject = { id: string; name: string; color_hex: string };
type Task = {
  id: string;
  day_of_week: number;
  subjects: { name: string; color_hex: string } | null;
};

const DAY_ABBREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Cronograma() {
  const supabase = createClient();

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetDay, setSheetDay] = useState<Date | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("schedule_tasks")
      .select("id, day_of_week, subjects(name, color_hex)")
      .order("created_at", { ascending: true });

    setTasks((data as Task[]) || []);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .order("name");
      setSubjects(subjectsData || []);
      await fetchTasks();
    }
    init();
  }, [supabase, fetchTasks]);

  const openSheet = (day: Date) => {
    setSheetDay(day);
    setSelectedSubject(null);
    setIsSheetOpen(true);
  };

  const handleSaveTask = async () => {
    if (!selectedSubject || !sheetDay || !userId) return;
    setIsSaving(true);

    // 0=Dom,1=Seg,...,6=Sáb  (JS getDay)
    const dayOfWeek = sheetDay.getDay();

    try {
      const { error } = await supabase.from("schedule_tasks").insert({
        user_id: userId,
        subject_id: selectedSubject.id,
        day_of_week: dayOfWeek,
      });

      if (error) throw error;

      toast.success("Tarefa agendada!", {
        description: `${selectedSubject.name} para ${format(sheetDay, "EEEE", { locale: ptBR })}.`,
      });
      setIsSheetOpen(false);
      await fetchTasks();
    } catch (err: any) {
      toast.error("Erro ao adicionar", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const weekLabel = `${format(currentWeekStart, "d MMM", { locale: ptBR })} – ${format(weekEnd, "d MMM", { locale: ptBR })}`;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Cronograma</h2>
          <p className="text-zinc-400">Planeje sua semana de estudos</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
            className="h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 min-h-[44px] min-w-[44px] rounded-lg"
          >
            <ChevronLeft size={18} />
          </Button>
          <span className="text-sm font-medium text-zinc-200 px-3 whitespace-nowrap capitalize">
            {weekLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
            className="h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 min-h-[44px] min-w-[44px] rounded-lg"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 w-full overflow-x-auto pb-6">
        <div className="flex lg:grid lg:grid-cols-7 gap-3 min-w-[760px] lg:min-w-0 h-full">
          {weekDays.map((day) => {
            const jsDay = day.getDay(); // 0=Dom, 1=Seg...
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const dayTasks = tasks.filter((t) => t.day_of_week === jsDay);

            return (
              <div
                key={jsDay}
                className={cn(
                  "flex flex-col flex-1 rounded-2xl border overflow-hidden min-h-[360px] w-[220px] lg:w-auto",
                  isToday
                    ? "border-indigo-500/40 bg-indigo-500/5 shadow-[0_0_24px_rgba(79,70,229,0.08)]"
                    : "border-zinc-800/50 bg-zinc-900/30"
                )}
              >
                {/* Day Header */}
                <div className={cn(
                  "p-3 text-center border-b",
                  isToday ? "bg-indigo-500/10 border-indigo-500/20" : "bg-zinc-900/50 border-zinc-800/50"
                )}>
                  <p className={cn("text-xs font-bold uppercase tracking-widest", isToday ? "text-indigo-400" : "text-zinc-500")}>
                    {DAY_ABBREV[jsDay]}
                  </p>
                  <p className={cn("text-xl font-bold mt-0.5", isToday ? "text-indigo-300" : "text-zinc-300")}>
                    {format(day, "dd")}
                  </p>
                </div>

                {/* Tasks */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {isLoading
                    ? <Skeleton className="h-10 w-full rounded-xl bg-zinc-800/50" />
                    : dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/60 text-sm"
                      >
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: task.subjects?.color_hex || "#4f46e5" }}
                        />
                        <span className="text-zinc-300 font-medium truncate">
                          {task.subjects?.name ?? "Matéria"}
                        </span>
                      </div>
                    ))
                  }
                </div>

                {/* Add Button */}
                <div className="p-2 mt-auto">
                  <Button
                    variant="outline"
                    className="w-full border-dashed border-zinc-700 bg-transparent text-zinc-500 hover:text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/50 rounded-xl min-h-[44px] text-xs"
                    onClick={() => openSheet(day)}
                  >
                    <Plus size={14} className="mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-zinc-600 italic text-center mt-4 hidden md:block">
        "Disciplina é a ponte entre metas e conquistas."
      </p>

      {/* Bottom Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Adicionar ao Cronograma</SheetTitle>
            <SheetDescription>
              {sheetDay && (
                <span className="capitalize">
                  {format(sheetDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-4 space-y-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Escolha a Matéria
            </p>
            <div className="flex flex-wrap gap-2">
              {subjects.length === 0 ? (
                <p className="text-sm text-zinc-500">Nenhuma matéria cadastrada ainda.</p>
              ) : (
                subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubject(s)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px] border flex items-center gap-2",
                      selectedSubject?.id === s.id
                        ? "bg-indigo-600 border-indigo-500 text-white ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950"
                        : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color_hex }} />
                    {s.name}
                  </button>
                ))
              )}
            </div>
          </div>

          <SheetFooter>
            <Button
              onClick={handleSaveTask}
              disabled={!selectedSubject || isSaving}
              className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A guardar...</>
              ) : (
                "Confirmar Agendamento"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
