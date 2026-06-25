"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCcw, Play, Pause, Save, Plus, Loader2, Award, Coffee, Timer, Music, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AddSubjectSheet } from "@/components/custom/AddSubjectSheet";

type Subject = { id: string; name: string; color_hex: string };

const DEFAULT_SUBJECTS = [
  { name: "Português", color_hex: "#EF4444" },
  { name: "Matemática", color_hex: "#3B82F6" },
  { name: "Direito Constitucional", color_hex: "#10B981" },
  { name: "Direito Administrativo", color_hex: "#F59E0B" },
  { name: "Raciocínio Lógico", color_hex: "#8B5CF6" },
  { name: "Informática", color_hex: "#EC4899" },
  { name: "Legislação Específica", color_hex: "#6366F1" },
  { name: "Direito Penal", color_hex: "#14B8A6" },
  { name: "Direito Civil", color_hex: "#F97316" },
  { name: "AFO", color_hex: "#6B7280" },
];

const POMODORO_PRESETS = [
  { label: "Clássico", focus: 25 * 60, break: 5 * 60, desc: "25 min Foco / 5 min Pausa" },
  { label: "Longo", focus: 50 * 60, break: 10 * 60, desc: "50 min Foco / 10 min Pausa" },
  { label: "Express", focus: 15 * 60, break: 3 * 60, desc: "15 min Foco / 3 min Pausa" },
  { label: "Rápido (Teste)", focus: 10, break: 5, desc: "10 seg Foco / 5 seg Pausa" },
];

const SOUNDS = [
  { id: "silence", name: "Silêncio 🔇", url: "" },
  { id: "white", name: "Ruído Branco 🌧️", url: "https://www.soundjay.com/nature/sounds/rain-01.mp3" },
  { id: "brown", name: "Ruído Marrom ⚡", url: "https://actions.google.com/sounds/v1/weather/rumbling_thunder.ogg" },
  { id: "classical", name: "Clássica 🎹", url: "https://upload.wikimedia.org/wikipedia/commons/1/18/Gymnopedie_No_1.ogg" }
];

export default function Cronometro() {
  const [mode, setMode] = useState<"cronometro" | "pomodoro">("cronometro");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  
  // Timer state
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Pomodoro-specific state
  const [presetIndex, setPresetIndex] = useState(0);
  const [pomodoroPhase, setPomodoroPhase] = useState<"focus" | "break">("focus");
  const [completedPomodorosCount, setCompletedPomodorosCount] = useState(0);

  // Audio elements
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeSoundId, setActiveSoundId] = useState("silence");
  const [isSoundDropdownOpen, setIsSoundDropdownOpen] = useState(false);

  // Load and seed subjects
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoadingSubjects(false);
        return;
      }
      setUserId(user.id);

      const { data: subjectsData, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erro ao carregar matérias");
      } else {
        let currentSubjects = subjectsData || [];
        
        const existingNames = new Set(currentSubjects.map(s => s.name.trim().toLowerCase()));
        const missingDefaults = DEFAULT_SUBJECTS.filter(s => !existingNames.has(s.name.trim().toLowerCase()));

        if (missingDefaults.length > 0) {
          const toInsert = missingDefaults.map(s => ({
            user_id: user.id,
            name: s.name,
            color_hex: s.color_hex
          }));
          const { data: insertedData, error: insertError } = await supabase
            .from('subjects')
            .insert(toInsert)
            .select();

          if (!insertError && insertedData) {
            currentSubjects = [...currentSubjects, ...insertedData];
            toast.success("Matérias padrão cadastradas com sucesso!");
          }
        }
        setSubjects(currentSubjects);
      }
      setIsLoadingSubjects(false);
    }
    loadData();
  }, [supabase]);

  // Reset time whenever mode, preset, or phase changes
  useEffect(() => {
    setIsRunning(false);
    if (mode === "cronometro") {
      setTime(0);
    } else {
      const activePreset = POMODORO_PRESETS[presetIndex];
      setTime(pomodoroPhase === "focus" ? activePreset.focus : activePreset.break);
    }
  }, [mode, presetIndex, pomodoroPhase]);

  // Handle focus sound selection
  const handleSoundChange = (soundId: string) => {
    setActiveSoundId(soundId);
    setIsSoundDropdownOpen(false);

    if (!audioRef.current) return;

    const sound = SOUNDS.find((s) => s.id === soundId);
    if (!sound || sound.id === "silence" || !sound.url) {
      audioRef.current.pause();
      audioRef.current.src = "";
    } else {
      audioRef.current.src = sound.url;
      audioRef.current.load();
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay blocked by browser. Interaction required.", err);
        toast.info("Clique na página para ativar o áudio de foco.");
      });
    }
  };

  // Audio beep generator using Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(pomodoroPhase === "focus" ? 880 : 660, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.error("Audio Context error:", e);
    }
  };

  const handlePomodoroComplete = async () => {
    playBeep();
    
    if (pomodoroPhase === "focus") {
      toast.success("Tempo de Foco concluído! 🎯", {
        description: "Excelente trabalho! Hora de descansar um pouco."
      });
      setCompletedPomodorosCount(prev => prev + 1);
      
      // Save this session to Supabase automatically if a subject is selected
      if (selectedSubject && userId) {
        const focusDurationSeconds = POMODORO_PRESETS[presetIndex].focus;
        const durationMinutes = Math.floor(focusDurationSeconds / 60);
        if (durationMinutes > 0) {
          try {
            const { error } = await supabase
              .from('study_sessions')
              .insert({
                user_id: userId,
                subject_id: selectedSubject.id,
                duration_minutes: durationMinutes,
                tipo: "pomodoro",
              });
            if (error) throw error;
            toast.success("Sessão registrada automaticamente!", {
              description: `Foram salvos ${durationMinutes} minutos em ${selectedSubject.name}.`
            });
          } catch (err: any) {
            toast.error("Erro ao salvar sessão automaticamente", { description: err.message });
          }
        }
      } else {
        toast.info("Sessão concluída!", {
          description: "Selecione uma matéria acima para salvar automaticamente suas próximas sessões de foco."
        });
      }
      
      setPomodoroPhase("break");
    } else {
      toast.success("Descanso concluído! ☕", {
        description: "Hora de voltar ao foco!"
      });
      setPomodoroPhase("focus");
    }
  };

  const handlePomodoroCompleteRef = useRef(handlePomodoroComplete);
  useEffect(() => {
    handlePomodoroCompleteRef.current = handlePomodoroComplete;
  });

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prev) => {
          if (mode === "cronometro") {
            return prev + 1;
          } else {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              setIsRunning(false);
              setTimeout(() => {
                handlePomodoroCompleteRef.current();
              }, 10);
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  // Before unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning || (mode === "cronometro" && time > 0)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning, time, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === "cronometro") {
      setTime(0);
    } else {
      const activePreset = POMODORO_PRESETS[presetIndex];
      setTime(pomodoroPhase === "focus" ? activePreset.focus : activePreset.break);
    }
  };

  const handleSave = async () => {
    if (!selectedSubject) {
      toast.error("Selecione uma matéria antes de salvar", { description: "Você precisa escolher o que estudou antes de salvar."});
      return;
    }
    
    const elapsedSeconds = mode === "cronometro" 
      ? time 
      : (pomodoroPhase === "focus" ? (POMODORO_PRESETS[presetIndex].focus - time) : 0);

    const durationMinutes = Math.floor(elapsedSeconds / 60);

    if (durationMinutes < 1) {
      toast.warning("Tempo insuficiente para registro", { description: "O tempo mínimo para registrar é 1 minuto." });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: userId,
          subject_id: selectedSubject.id,
          duration_minutes: durationMinutes,
          tipo: mode === "pomodoro" ? "pomodoro" : "cronometro",
        });

      if (error) throw error;

      toast.success("Sessão salva com sucesso!", {
        description: `+${durationMinutes} minutos salvos em ${selectedSubject.name} nas suas métricas.`
      });
      resetTimer();
    } catch (err: any) {
      toast.error("Erro ao salvar", { description: err.message });
    } finally {
      setIsSaving(false);
    }
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

  const activeSound = SOUNDS.find((s) => s.id === activeSoundId) || SOUNDS[0];

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] animate-in fade-in duration-500 pt-4 md:pt-12 pb-10">
      
      {/* HTML5 Audio Loop element */}
      <audio ref={audioRef} loop />

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
          {isLoadingSubjects ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-32 rounded-full bg-zinc-800" />
            ))
          ) : (
            <>
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-medium transition-colors border min-h-[44px]",
                    selectedSubject?.id === subject.id 
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950" 
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color_hex }} />
                    {subject.name}
                  </span>
                </button>
              ))}
              <button className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 flex items-center gap-2 bg-zinc-900/30 min-h-[44px]" onClick={() => setIsAddSubjectOpen(true)}>
                <Plus size={16} /> Nova
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pomodoro Presets Selector */}
      {mode === "pomodoro" && (
        <div className="mb-8 flex flex-col items-center gap-3 w-full max-w-md px-4 animate-in slide-in-from-top-4 duration-300">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Configuração Pomodoro</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
            {POMODORO_PRESETS.map((preset, idx) => (
              <button
                key={preset.label}
                onClick={() => {
                  setPresetIndex(idx);
                  setPomodoroPhase("focus");
                }}
                className={cn(
                  "p-3 rounded-2xl border text-center transition-all min-h-[48px]",
                  presetIndex === idx
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                    : "bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                )}
              >
                <div className="text-xs font-bold">{preset.label}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{preset.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-4 items-center justify-center mt-2 text-sm">
            <span className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
              pomodoroPhase === "focus"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-teal-500/10 border-teal-500/30 text-teal-400"
            )}>
              {pomodoroPhase === "focus" ? (
                <>
                  <Timer size={13} className="animate-spin" /> Fase de Foco
                </>
              ) : (
                <>
                  <Coffee size={13} /> Pausa / Descanso
                </>
              )}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Award size={14} className="text-zinc-500" />
              Ciclos Concluídos: <strong className="text-zinc-100">{completedPomodorosCount}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Bloco do Cronômetro */}
      <div className="w-full flex-1 flex flex-col items-center justify-center mt-4">
        <Card className="bg-zinc-950/50 border-zinc-800/50 shadow-2xl overflow-hidden relative w-full max-w-md rounded-3xl mx-4">
          {isRunning && (
            <div className={cn(
              "absolute inset-0 blur-[80px] animate-pulse rounded-full pointer-events-none",
              mode === "pomodoro"
                ? (pomodoroPhase === "focus" ? "bg-amber-500/10" : "bg-teal-500/10")
                : "bg-emerald-500/10"
            )} />
          )}
          
          <CardContent className="p-8 md:p-14 flex flex-col items-center relative z-10">
            
            {/* Ambient Sound Player Selector */}
            <div className="absolute top-4 right-4 z-20">
              <div className="relative">
                <Button
                  onClick={() => setIsSoundDropdownOpen(!isSoundDropdownOpen)}
                  variant="outline"
                  size="sm"
                  className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center gap-2 rounded-xl text-xs h-9 px-3"
                >
                  {activeSoundId === "silence" ? <VolumeX size={15} /> : <Volume2 size={15} className="animate-pulse text-indigo-400" />}
                  <span>{activeSound.name.split(" ")[0]}</span>
                </Button>

                {isSoundDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsSoundDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in duration-200">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/50">
                        Sons de Foco
                      </div>
                      {SOUNDS.map((sound) => (
                        <button
                          key={sound.id}
                          onClick={() => handleSoundChange(sound.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between",
                            activeSoundId === sound.id 
                              ? "bg-indigo-600/20 text-indigo-200 font-medium" 
                              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                          )}
                        >
                          <span>{sound.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={cn(
              "text-[5rem] md:text-8xl font-mono font-light tracking-tighter tabular-nums mb-12 mt-4",
              mode === "pomodoro"
                ? (pomodoroPhase === "focus" ? "text-amber-400" : "text-teal-400")
                : "text-zinc-100"
            )}>
              {formatTime(time)}
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-8 w-full">
              {/* Reset Button */}
              <Button 
                variant="outline" 
                size="icon"
                onClick={resetTimer}
                disabled={isSaving}
                className="w-16 h-16 rounded-full border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80"
              >
                <RotateCcw size={24} />
              </Button>
              
              {/* Play / Pause Button */}
              <Button 
                size="icon"
                onClick={toggleTimer}
                disabled={isSaving}
                className={cn(
                  "w-24 h-24 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl",
                  isRunning 
                    ? "bg-zinc-600 hover:bg-zinc-500 text-zinc-100 shadow-zinc-600/20" 
                    : (mode === "pomodoro"
                        ? (pomodoroPhase === "focus" ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20" : "bg-teal-500 hover:bg-teal-400 text-zinc-950 shadow-teal-500/20")
                        : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20"
                      )
                )}
              >
                {isRunning ? <Pause size={36} /> : <Play size={36} className="ml-1" />}
              </Button>

              {/* Save Button */}
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleSave}
                disabled={isSaving || (mode === "cronometro" ? time === 0 : (pomodoroPhase === "focus" ? (POMODORO_PRESETS[presetIndex].focus === time) : true))}
                className="w-16 h-16 rounded-full border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 disabled:opacity-30 disabled:border-zinc-900 disabled:text-zinc-600"
              >
                {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
              </Button>
            </div>
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
        }}
      />
    </div>
  );
}
