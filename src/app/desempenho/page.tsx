"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import { fetchSessionsForRange, aggregateBySubject, StudySession, fetchQuizAttemptsForRange, QuizAttempt } from "@/lib/study-data";
import { QuestoesTab } from "@/components/custom/QuestoesTab";

const FILTERS = ["Hoje", "Semana", "Mês", "Ano", "Tudo"];

export default function Desempenho() {
  const [activeFilter, setActiveFilter] = useState("Semana");
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [bySubject, setBySubject] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { sessions: data } = await fetchSessionsForRange(activeFilter);
      const { attempts } = await fetchQuizAttemptsForRange(activeFilter);
      setSessions(data);
      setQuizAttempts(attempts);
      setBySubject(aggregateBySubject(data));
      setIsLoading(false);
    }
    load();
  }, [activeFilter]);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalHours = parseFloat((totalMinutes / 60).toFixed(1));
  const uniqueSubjects = new Set(sessions.map((s) => s.subject_id)).size;
  const avgDaily = sessions.length > 0 ? parseFloat((totalMinutes / 60 / 7).toFixed(1)) : 0;

  const totalAttempts = quizAttempts.length;
  const correctAttempts = quizAttempts.filter(a => a.is_correct).length;
  const accuracyRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">

      {/* Header com Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Desempenho</h2>
          <p className="text-sm font-medium text-zinc-500 mt-1">Acompanhe seu progresso nos estudos</p>
        </div>
        <div className="flex flex-wrap gap-1 bg-zinc-900/80 p-1.5 rounded-full border border-zinc-800/50">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 min-h-[40px]",
                activeFilter === filter
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="horas" className="w-full">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 h-auto rounded-xl inline-flex min-w-max gap-1">
            <TabsTrigger value="horas" className="rounded-lg py-2.5 px-5 min-h-[44px]">
              Horas Estudadas
            </TabsTrigger>
            <TabsTrigger value="questoes" className="rounded-lg py-2.5 px-5 min-h-[44px]">
              Questões
            </TabsTrigger>
            <TabsTrigger value="assuntos" className="rounded-lg py-2.5 px-5 min-h-[44px]">
              Por Assuntos
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="horas" className="space-y-6 mt-6">
          {/* Mini-cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Período", value: isLoading ? null : `${totalHours}h`, sub: `${totalMinutes % 60}m` },
              { label: "Média Diária", value: isLoading ? null : `${avgDaily}h`, sub: "por dia" },
              { label: "Acerto Geral", value: isLoading ? null : totalAttempts > 0 ? `${accuracyRate}%` : "–", sub: totalAttempts > 0 ? `${correctAttempts}/${totalAttempts} acertos` : "sem questões" },
              { label: "Registros", value: isLoading ? null : String(sessions.length), sub: "sessões" },
            ].map((card) => (
              <Card key={card.label} className="bg-zinc-900 border-zinc-800/50 rounded-2xl">
                <CardContent className="p-6">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{card.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-10 w-24 bg-zinc-800 mt-2" />
                  ) : (
                    <div className="text-3xl font-bold text-zinc-100 mt-2">
                      {card.value}
                      {card.sub && <span className="text-base text-zinc-500 font-normal ml-1">{card.sub}</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Donut */}
            <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-zinc-100">Horas por Matéria</CardTitle>
                <CardDescription className="text-zinc-400">Distribuição do período</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[220px] w-full rounded-xl bg-zinc-800" />
                ) : bySubject.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-16">Sem dados para o período selecionado.</p>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="h-[200px] w-full sm:w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={bySubject} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                            {bySubject.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                            itemStyle={{ color: "#e4e4e7" }}
                            formatter={(v: any) => [`${parseFloat((v / 60).toFixed(1))}h`, ""]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full sm:w-1/2 space-y-3">
                      {bySubject.map((s) => (
                        <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                            <span className="text-zinc-300 font-medium text-sm truncate">{s.name}</span>
                          </div>
                          <span className="text-base font-bold text-zinc-100 ml-2 shrink-0">{s.hours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar Chart Comparativo */}
            <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-zinc-100">Comparativo</CardTitle>
                <CardDescription className="text-zinc-400">Tempo por disciplina</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[250px] w-full rounded-xl bg-zinc-800" />
                ) : bySubject.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-16">Sem dados para o período.</p>
                ) : (
                  <div className="h-[250px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bySubject} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
                        <Tooltip
                          cursor={{ fill: "#27272a" }}
                          contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                          itemStyle={{ color: "#e4e4e7" }}
                          formatter={(v: any) => [`${v}h`, "Horas"]}
                        />
                        <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                          {bySubject.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questoes" className="mt-6">
          <QuestoesTab />
        </TabsContent>

        <TabsContent value="assuntos" className="mt-6">
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl">
            <CardContent className="p-12 text-center text-zinc-500">
              <p>Em breve: análise de desempenho por assunto específico.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
