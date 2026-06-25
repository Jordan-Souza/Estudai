"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Option = { A: string; B: string; C: string; D: string; E: string };
export type AIQuestion = {
  id: number;
  question: string;
  options: Option;
  correct_answer: keyof Option;
  explanation: string;
};

type AIQuestionsModalProps = {
  open: boolean;
  onClose: () => void;
  questions: AIQuestion[];
  subjectName: string;
  subjectId: string;
};

export function AIQuestionsModal({ open, onClose, questions, subjectName, subjectId }: AIQuestionsModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<keyof Option | null>(null);
  const [score, setScore] = useState(0);
  const supabase = createClient();
  const [finished, setFinished] = useState(false);

  if (!questions.length) return null;
  const q = questions[currentIdx];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === q?.correct_answer;

  const handleAnswer = async (opt: keyof Option) => {
    if (isAnswered) return;
    setSelectedAnswer(opt);
    const isAnsCorrect = opt === q.correct_answer;
    if (isAnsCorrect) setScore((s) => s + 1);

    // Salvar a tentativa
    const { data: { user } } = await supabase.auth.getUser();
    if (user && subjectId) {
      await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        subject_id: subjectId,
        question_text: q.question,
        is_correct: isAnsCorrect,
      });
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
  };

  const optionStyle = (opt: keyof Option) => {
    if (!isAnswered) return "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-zinc-100";
    if (opt === q.correct_answer) return "border-emerald-500/60 bg-emerald-500/10 text-emerald-300";
    if (opt === selectedAnswer) return "border-red-500/60 bg-red-500/10 text-red-300";
    return "border-zinc-800/50 bg-zinc-900/30 text-zinc-500";
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[92vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 mx-4">

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>

          {finished ? (
            /* Tela de Resultado */
            <div className="flex flex-col items-center text-center py-8 gap-6">
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold border-4",
                score >= 7 ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" :
                score >= 5 ? "border-amber-500/50 bg-amber-500/10 text-amber-400" :
                "border-red-500/50 bg-red-500/10 text-red-400"
              )}>
                {score}/{questions.length}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-100">
                  {score >= 7 ? "Excelente!" : score >= 5 ? "Bom desempenho!" : "Continue praticando!"}
                </h2>
                <p className="text-zinc-400 mt-2">
                  Você acertou {score} de {questions.length} questões inéditas de {subjectName}.
                </p>
              </div>
              <div className="flex gap-3 w-full max-w-xs">
                <Button onClick={handleReset} variant="outline" className="flex-1 border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-xl">
                  Tentar novamente
                </Button>
                <Button onClick={onClose} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            /* Tela de Questão */
            <div className="space-y-6">
              {/* Progress Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">{subjectName}</p>
                  <h3 className="text-sm font-medium text-zinc-300 mt-0.5">✨ Questões Geradas por IA</h3>
                </div>
                <span className="text-sm font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                  {currentIdx + 1} / {questions.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/50">
                <p className="text-zinc-100 leading-relaxed font-medium">{q.question}</p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {(Object.keys(q.options) as (keyof Option)[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 group",
                      optionStyle(opt)
                    )}
                  >
                    <span className={cn(
                      "w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 text-xs font-bold transition-colors",
                      !isAnswered && "border-zinc-700 text-zinc-500 group-hover:border-indigo-500/50 group-hover:text-indigo-400",
                      isAnswered && opt === q.correct_answer && "border-emerald-500 text-emerald-400 bg-emerald-500/20",
                      isAnswered && opt === selectedAnswer && opt !== q.correct_answer && "border-red-500 text-red-400 bg-red-500/20",
                    )}>
                      {!isAnswered ? opt :
                        opt === q.correct_answer ? <CheckCircle2 size={14} /> :
                        opt === selectedAnswer ? <XCircle size={14} /> : opt}
                    </span>
                    <span className="text-sm leading-relaxed pt-0.5">{q.options[opt]}</span>
                  </button>
                ))}
              </div>

              {/* Explanation (after answer) */}
              {isAnswered && (
                <div className={cn(
                  "p-4 rounded-xl border flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-red-500/10 border-red-500/30"
                )}>
                  <Lightbulb size={18} className={isCorrect ? "text-emerald-400 shrink-0 mt-0.5" : "text-red-400 shrink-0 mt-0.5"} />
                  <div>
                    <p className={cn("text-sm font-semibold mb-1", isCorrect ? "text-emerald-400" : "text-red-400")}>
                      {isCorrect ? "✓ Correto!" : "✗ Incorreto"}
                    </p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              )}

              {isAnswered && (
                <Button
                  onClick={handleNext}
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  {currentIdx < questions.length - 1 ? "Próxima Questão →" : "Ver Resultado Final"}
                </Button>
              )}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
