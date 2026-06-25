"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Loader2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AddSubjectSheet } from "@/components/custom/AddSubjectSheet";

type Subject = { id: string; name: string; color_hex: string };
type Session = {
  id: string;
  duration_minutes: number;
  date_log: string;
  subjects: { name: string; color_hex: string } | null;
};

type FormErrors = {
  subject?: string;
  duration?: string;
};

export default function RegistrarEstudo() {
  const supabase = createClient();

  // Form State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Add Subject Sheet
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  // Data State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchRecentSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    const { data } = await supabase
      .from("study_sessions")
      .select("id, duration_minutes, date_log, subjects(name, color_hex)")
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentSessions((data as Session[]) || []);
    setIsLoadingSessions(false);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .order("created_at", { ascending: false });
      setSubjects(subjectsData || []);
      setIsLoadingSubjects(false);

      await fetchRecentSessions();
    }
    init();
  }, [supabase, fetchRecentSessions]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!selectedSubject) newErrors.subject = "Escolha uma matéria.";
    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    if (totalMinutes < 1) newErrors.duration = "A duração mínima é 1 minuto.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);

    try {
      const { error } = await supabase.from("study_sessions").insert({
        user_id: userId,
        subject_id: selectedSubject!.id,
        duration_minutes: totalMinutes,
        date_log: format(selectedDate, "yyyy-MM-dd"),
      });

      if (error) throw error;

      toast.success("Sessão registrada!", {
        description: `${totalMinutes}min de ${selectedSubject!.name} em ${format(selectedDate, "dd/MM")} foram salvos.`,
      });

      // Reset form
      setSelectedSubject(null);
      setHours("");
      setMinutes("");
      setErrors({});
      await fetchRecentSessions();
    } catch (err: any) {
      toast.error("Erro ao registrar", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Registrar Estudo</h2>
        <p className="text-zinc-400 mt-1">Adicione manualmente uma sessão de estudo.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulário */}
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800/50 rounded-2xl">
          <CardContent className="p-6 md:p-8 space-y-10">

            {/* DATA */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Data</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-auto justify-start text-left font-normal h-12 rounded-xl border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100 px-4",
                    )}
                  >
                    <CalendarIcon className="mr-3 h-4 w-4 text-indigo-400" />
                    {format(selectedDate, "PPPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }}
                    disabled={(d) => d > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* MATÉRIA */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Matéria</Label>
              <div className="flex flex-wrap gap-2">
                {isLoadingSubjects
                  ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-32 rounded-full bg-zinc-800" />)
                  : subjects.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSubject(s); setErrors(prev => ({...prev, subject: undefined})); }}
                      className={cn(
                        "px-5 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px] border flex items-center gap-2",
                        selectedSubject?.id === s.id
                          ? "bg-indigo-600 border-indigo-500 text-white ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900"
                          : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                      )}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color_hex }} />
                      {s.name}
                    </button>
                  ))
                }
                <button
                    className="px-5 py-2.5 rounded-full text-sm font-medium border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 flex items-center gap-2 min-h-[44px]"
                    onClick={() => setIsAddSubjectOpen(true)}
                  >
                    <Plus size={16} /> Nova Matéria
                  </button>
              </div>
              {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject}</p>}
            </div>

            {/* DURAÇÃO */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Duração</Label>
              <div className="flex items-end gap-3">
                <div className="flex flex-col items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={hours}
                    onChange={(e) => { setHours(e.target.value); setErrors(prev => ({...prev, duration: undefined})); }}
                    className={cn("w-24 h-24 text-5xl font-light text-center rounded-2xl bg-zinc-950 border-zinc-800 focus-visible:ring-indigo-500", errors.duration && "border-red-500/50")}
                    min="0"
                  />
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Horas</span>
                </div>
                <span className="text-4xl font-light text-zinc-700 mb-8">:</span>
                <div className="flex flex-col items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={minutes}
                    onChange={(e) => { setMinutes(e.target.value); setErrors(prev => ({...prev, duration: undefined})); }}
                    className={cn("w-24 h-24 text-5xl font-light text-center rounded-2xl bg-zinc-950 border-zinc-800 focus-visible:ring-indigo-500", errors.duration && "border-red-500/50")}
                    min="0"
                    max="59"
                  />
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Minutos</span>
                </div>
              </div>
              {errors.duration && <p className="text-xs text-red-400 mt-1">{errors.duration}</p>}
            </div>

            <div className="pt-6 border-t border-zinc-800/50">
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="w-full h-14 rounded-xl text-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20"
              >
                {isSaving ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> A guardar...</>
                ) : (
                  "Salvar Sessão de Estudo"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registros Recentes */}
        <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl h-fit">
          <CardHeader>
            <CardTitle className="text-zinc-100">Registros Recentes</CardTitle>
            <CardDescription className="text-zinc-400">Últimas sessões salvas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingSessions
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl bg-zinc-800" />)
              : recentSessions.length === 0
                ? <p className="text-sm text-zinc-500 text-center py-6">Nenhum registro ainda.</p>
                : recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: session.subjects?.color_hex || '#4f46e5' }} />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-zinc-200">{session.subjects?.name ?? "Matéria"}</span>
                        <span className="text-xs text-zinc-500">{format(new Date(session.date_log + 'T12:00:00'), "dd/MM/yyyy")}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                      <Clock size={12} />
                      {formatDuration(session.duration_minutes)}
                    </span>
                  </div>
                ))
            }
          </CardContent>
        </Card>
      </div>

      <AddSubjectSheet
        open={isAddSubjectOpen}
        onOpenChange={setIsAddSubjectOpen}
        userId={userId}
        onSubjectAdded={(newSubject) => {
          setSubjects((prev) => [newSubject, ...prev]);
          setSelectedSubject(newSubject);
          setErrors(prev => ({ ...prev, subject: undefined }));
        }}
      />
    </div>
  );
}
