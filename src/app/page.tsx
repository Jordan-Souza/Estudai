"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Target, CheckCircle2, Library, Flame, Trophy, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { fetchSessionsForRange, aggregateBySubject, aggregateByDay, StudySession, fetchQuizAttemptsForRange, QuizAttempt } from "@/lib/study-data";
import { Sparkles } from "lucide-react";

const WEEKLY_GOAL_HOURS = 28;

export default function Dashboard() {
  const supabase = createClient();
  const [userName, setUserName] = useState("...");
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [bySubject, setBySubject] = useState<any[]>([]);
  const [byDay, setByDay] = useState<any[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  const currentDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date());
  const todayIndex = new Date().getDay();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Estudante";
        setUserName(name.split(" ")[0]);
      }

      const { sessions: sessionData } = await fetchSessionsForRange("Semana");
      const { attempts } = await fetchQuizAttemptsForRange("Semana");
      setSessions(sessionData);
      setQuizAttempts(attempts);
      setBySubject(aggregateBySubject(sessionData));
      setByDay(aggregateByDay(sessionData));
      setIsLoading(false);
    }
    init();
  }, [supabase]);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalHours = totalMinutes / 60;
  const weekProgressPercent = Math.min(Math.round((totalHours / WEEKLY_GOAL_HOURS) * 100), 100);
  const uniqueSubjects = new Set(sessions.map((s) => s.subject_id)).size;

  const totalAttempts = quizAttempts.length;
  const correctAttempts = quizAttempts.filter(a => a.is_correct).length;
  const accuracyRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Olá, {userName}! 👋</h2>
          <p className="text-zinc-400 capitalize mt-1">{currentDate}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-md w-full">
          <div className="flex items-start gap-3">
            <Trophy className="text-amber-500 shrink-0 mt-1" size={20} />
            <p className="text-sm text-amber-500/90 leading-tight">
              Desbloqueie todo o potencial. Questões, ranking, conquistas...
            </p>
          </div>
          <Button variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-zinc-950 shrink-0 rounded-lg w-full sm:w-auto">
            Upgrade
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Horas na Semana</CardTitle>
            <Clock className="text-indigo-400" size={18} />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24 bg-zinc-800 mt-1" /> : (
              <>
                <div className="text-2xl font-bold text-zinc-100">
                  {Math.floor(totalHours)}h
                  {totalMinutes % 60 > 0 && <span className="text-lg text-zinc-500 font-normal"> {totalMinutes % 60}m</span>}
                  <span className="text-lg text-zinc-500 font-normal"> / {WEEKLY_GOAL_HOURS}h</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{weekProgressPercent}% da meta concluída</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Questões (Semana)</CardTitle>
            <Sparkles className="text-indigo-400" size={18} />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16 bg-zinc-800 mt-1" /> : (
              <div className="text-2xl font-bold text-zinc-100">{totalAttempts}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Acerto Geral</CardTitle>
            <CheckCircle2 className="text-emerald-500" size={18} />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16 bg-zinc-800 mt-1" /> : totalAttempts === 0 ? (
              <>
                <div className="text-2xl font-bold text-zinc-100">–</div>
                <p className="text-xs text-zinc-500 mt-1">Sem questões</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-zinc-100">{accuracyRate}%</div>
                <p className="text-xs text-zinc-500 mt-1">{correctAttempts} de {totalAttempts} acertos</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Matérias</CardTitle>
            <Library className="text-indigo-400" size={18} />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-12 bg-zinc-800 mt-1" /> : (
              <div className="text-2xl font-bold text-zinc-100">{uniqueSubjects}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Progresso */}
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-zinc-100">Horas de Estudo</CardTitle>
              <CardDescription className="text-zinc-400">Progresso da meta semanal ({WEEKLY_GOAL_HOURS}h)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? <Skeleton className="h-2 w-full bg-zinc-800" /> : (
                <Progress value={weekProgressPercent} className="h-2 bg-zinc-800 [&>div]:bg-indigo-500" />
              )}
              {!isLoading && weekProgressPercent < 50 && (
                <div className="flex items-center gap-2 text-sm text-amber-500/90 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                  <Info size={16} className="shrink-0" />
                  Você está abaixo do ritmo ideal. Intensifique seus estudos!
                </div>
              )}
              {!isLoading && weekProgressPercent >= 100 && (
                <div className="flex items-center gap-2 text-sm text-emerald-500 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 size={16} className="shrink-0" />
                  Meta semanal atingida! Excelente disciplina!
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-zinc-500 italic w-full text-center">
                "Consistência é a chave. Todo esforço soma."
              </p>
            </CardFooter>
          </Card>

          {/* Horas por Dia */}
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-zinc-100">Horas por Dia</CardTitle>
              <CardDescription className="text-zinc-400">Seu volume diário de estudo esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full bg-zinc-800 rounded-xl" />
              ) : (
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
                      <Tooltip
                        cursor={{ fill: "#27272a" }}
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                        itemStyle={{ color: "#e4e4e7" }}
                        formatter={(v: any) => [`${v}h`, "Horas"]}
                      />
                      <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                        {byDay.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === todayIndex ? "#4f46e5" : "#3f3f46"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Desempenho por Matéria */}
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-zinc-100">Desempenho por Matéria</CardTitle>
              <CardDescription className="text-zinc-400">Horas estudadas nesta semana</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl bg-zinc-800" />)}
                </div>
              ) : bySubject.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">Nenhuma sessão registrada esta semana.</p>
              ) : (
                <div className="space-y-3">
                  {bySubject.map((s) => (
                    <div key={s.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50 gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{s.name}</p>
                          <p className="text-xs text-zinc-500">{s.hours}h estudadas</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">

          {/* Distribuição de Tempo */}
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-zinc-100">Distribuição da Semana</CardTitle>
              <CardDescription className="text-zinc-400">Por matéria</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {isLoading ? (
                <Skeleton className="h-[180px] w-[180px] rounded-full bg-zinc-800" />
              ) : bySubject.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-12">Sem dados</p>
              ) : (
                <>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bySubject}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={78}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {bySubject.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                          itemStyle={{ color: "#e4e4e7" }}
                          formatter={(v: any) => [`${Math.round(v / 60 * 10) / 10}h`, ""]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full space-y-3 mt-4">
                    {bySubject.map((s) => (
                      <div key={s.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-zinc-400 truncate max-w-[100px]">{s.name}</span>
                        </div>
                        <span className="font-medium text-zinc-200">{s.hours}h</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Progresso Anual Mock */}
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-zinc-100">Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between pb-5 border-b border-zinc-800/50">
                <div>
                  <span className="text-sm text-zinc-400">Sessões totais</span>
                  <div className="text-2xl font-bold text-zinc-100 mt-1 flex items-center gap-2">
                    {isLoading ? <Skeleton className="h-8 w-16 bg-zinc-800" /> : sessions.length}
                    <Flame className="text-amber-500" size={20} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-5">
                <div>
                  <span className="text-sm text-zinc-400">Total de horas (semana)</span>
                  <div className="text-2xl font-bold text-zinc-100 mt-1">
                    {isLoading ? <Skeleton className="h-8 w-20 bg-zinc-800" /> : `${Math.floor(totalHours)}h`}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <p className="text-xs text-zinc-500 italic w-full text-center">
                "A disciplina leva a lugares onde a motivação não alcança."
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
