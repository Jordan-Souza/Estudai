"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, BookOpen, Plus, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIQuestionsModal, type AIQuestion } from "@/components/custom/AIQuestionsModal";

const AI_THRESHOLD = 5;

type Subject = { id: string; name: string; color_hex: string };
type ErrorEntry = {
  id: string;
  subject_id: string;
  original_question: string;
  user_notes: string | null;
  created_at: string;
};
type SubjectStats = Subject & { count: number; entries: ErrorEntry[] };

export function QuestoesTab() {
  const supabase = createClient();

  // Form state
  const [question, setQuestion] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Data state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // AI state
  const [generatingForSubject, setGeneratingForSubject] = useState<string | null>(null);
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);
  const [aiSubjectName, setAiSubjectName] = useState("");
  const [aiSubjectId, setAiSubjectId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("*")
      .order("name");
    const subs = (subjectsData as Subject[]) || [];
    setSubjects(subs);

    const { data: entriesData } = await supabase
      .from("error_notebook")
      .select("id, subject_id, original_question, user_notes, created_at")
      .order("created_at", { ascending: false });

    const entries = (entriesData as ErrorEntry[]) || [];

    // Group by subject
    const statsMap: Record<string, SubjectStats> = {};
    subs.forEach((s) => {
      statsMap[s.id] = { ...s, count: 0, entries: [] };
    });
    entries.forEach((e) => {
      if (statsMap[e.subject_id]) {
        statsMap[e.subject_id].count += 1;
        statsMap[e.subject_id].entries.push(e);
      }
    });

    // Only subjects that have at least 1 entry
    setSubjectStats(
      Object.values(statsMap)
        .filter((s) => s.count > 0)
        .sort((a, b) => b.count - a.count)
    );

    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      await fetchData();
    }
    init();
  }, [supabase, fetchData]);

  const handleSave = async () => {
    if (!question.trim()) {
      toast.warning("Campo obrigatório", { description: "Cole a questão que você errou." });
      return;
    }
    if (!selectedSubjectId) {
      toast.warning("Selecione a matéria", { description: "Vincule a questão a uma matéria." });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("error_notebook").insert({
        user_id: userId,
        subject_id: selectedSubjectId,
        original_question: question.trim(),
        user_notes: userNotes.trim() || null,
      });

      if (error) throw error;

      toast.success("Questão salva no repositório!", {
        description: "Continue adicionando para desbloquear as inéditas com IA.",
      });
      setQuestion("");
      setUserNotes("");
      await fetchData();
    } catch (err: any) {
      toast.error("Erro ao salvar", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAI = async (stat: SubjectStats) => {
    setGeneratingForSubject(stat.id);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId: stat.id, subjectName: stat.name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar questões.");

      setAiQuestions(data.questions || []);
      setAiSubjectName(stat.name);
      setAiSubjectId(stat.id);
      setModalOpen(true);
    } catch (err: any) {
      toast.error("Erro ao gerar questões", { description: err.message });
    } finally {
      setGeneratingForSubject(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("error_notebook").delete().eq("id", id);
    if (error) { toast.error("Erro ao remover"); return; }
    await fetchData();
  };

  return (
    <div className="space-y-8">
      {/* Form Area */}
      <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-400" />
            Caderno de Erros Inteligente
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Cole questões que errou em outras plataformas. Com {AI_THRESHOLD} questões por matéria, a IA gera 10 inéditas focadas nas suas fraquezas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Questão que você errou *
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Cole aqui o enunciado completo da questão..."
              rows={5}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 resize-none transition-colors"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                Matéria *
              </label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Selecione a matéria..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: s.color_hex }} />
                        {s.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                Por que errei? (opcional)
              </label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Ex: Confundi os prazos do CTN..."
                rows={2}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 resize-none transition-colors"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || !question.trim() || !selectedSubjectId}
            className="h-12 px-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium border border-zinc-700"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
            ) : (
              <><Plus size={18} className="mr-2" /> Salvar no Repositório</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Dashboard do Repositório */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-200">Repositório de Erros</h3>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-2xl bg-zinc-800" />)}
          </div>
        ) : subjectStats.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl">
            <CardContent className="p-12 text-center text-zinc-500 space-y-3">
              <BookOpen size={40} className="mx-auto opacity-30" />
              <p className="font-medium">Repositório vazio</p>
              <p className="text-sm">Adicione questões que você errou para começar a construir seu caderno inteligente.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {subjectStats.map((stat) => {
              const progress = Math.min((stat.count / AI_THRESHOLD) * 100, 100);
              const unlocked = stat.count >= AI_THRESHOLD;
              const isGenerating = generatingForSubject === stat.id;

              return (
                <Card key={stat.id} className={cn(
                  "bg-zinc-900 border-zinc-800/50 rounded-2xl overflow-hidden transition-shadow",
                  unlocked && "shadow-[0_0_20px_rgba(79,70,229,0.08)]"
                )}>
                  {unlocked && (
                    <div className="h-0.5 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600" />
                  )}
                  <CardContent className="p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color_hex }} />
                        <h4 className="font-semibold text-zinc-100">{stat.name}</h4>
                      </div>
                      <span className={cn(
                        "text-xs font-bold px-3 py-1 rounded-full border",
                        unlocked
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                          : "bg-zinc-800/50 border-zinc-700 text-zinc-500"
                      )}>
                        {stat.count} questão{stat.count !== 1 ? "ões" : ""}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>{stat.count} / {AI_THRESHOLD} para desbloquear IA</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress
                        value={progress}
                        className={cn(
                          "h-2 bg-zinc-800",
                          unlocked ? "[&>div]:bg-indigo-500" : "[&>div]:bg-zinc-600"
                        )}
                      />
                    </div>

                    {/* AI Button */}
                    {unlocked ? (
                      <Button
                        onClick={() => handleGenerateAI(stat)}
                        disabled={isGenerating}
                        className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 transition-all"
                      >
                        {isGenerating ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando com IA...</>
                        ) : (
                          <><Sparkles size={18} className="mr-2" /> Gerar 10 Questões Inéditas</>
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-800/40 rounded-xl p-3 border border-dashed border-zinc-700">
                        <AlertTriangle size={14} className="text-amber-500/70 shrink-0" />
                        Adicione mais {AI_THRESHOLD - stat.count} questão{AI_THRESHOLD - stat.count !== 1 ? "ões" : ""} para desbloquear a IA
                      </div>
                    )}

                    {/* Recent entries list */}
                    {stat.entries.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/40 group">
                        <p className="text-xs text-zinc-400 flex-1 line-clamp-2 leading-relaxed">
                          {entry.original_question}
                        </p>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all p-1 shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {stat.count > 3 && (
                      <p className="text-xs text-zinc-600 text-center">+{stat.count - 3} mais...</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Modal */}
      <AIQuestionsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        questions={aiQuestions}
        subjectName={aiSubjectName}
        subjectId={aiSubjectId}
      />
    </div>
  );
}
