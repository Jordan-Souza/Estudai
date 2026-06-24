"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, CheckCircle2, Library, Flame, Trophy, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

// Mock Data
const userName = "Jordan";
const currentDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());

const weeklyStudyData = [
  { name: "Seg", hours: 2 },
  { name: "Ter", hours: 3 },
  { name: "Qua", hours: 1.5 },
  { name: "Qui", hours: 4 },
  { name: "Sex", hours: 2.5 },
  { name: "Sáb", hours: 0 },
  { name: "Dom", hours: 0 },
];
const todayIndex = new Date().getDay(); 
const chartTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

const subjectsData = [
  { name: "Direito Civil", value: 30, color: "#10b981" }, // Emerald 500
  { name: "Administrativo", value: 45, color: "#4f46e5" }, // Indigo 600
  { name: "Constitucional", value: 25, color: "#f59e0b" }, // Amber 500
];

const subjectPerformance = [
  { name: "Direito Civil", questions: 120, hours: 4.5 },
  { name: "Administrativo", questions: 85, hours: 3.2 },
  { name: "Constitucional", questions: 50, hours: 2.1 },
  { name: "Penal", questions: 30, hours: 1.5 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Header & Banner */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Olá, {userName}! 👋</h2>
          <p className="text-zinc-400 capitalize">{currentDate}</p>
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

      {/* Top 4 Cards Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Horas na Semana</CardTitle>
            <Clock className="text-indigo-400" size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">13h <span className="text-lg text-zinc-500 font-normal">/ 28h</span></div>
            <p className="text-xs text-zinc-500 mt-1">
              46% da meta concluída
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Questões (Semana)</CardTitle>
            <Target className="text-indigo-400" size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">285</div>
            <p className="text-xs text-zinc-500 mt-1">
              +45 desde ontem
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Acerto Geral</CardTitle>
            <CheckCircle2 className="text-emerald-500" size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">78.5%</div>
            <p className="text-xs text-emerald-500/80 mt-1">
              +2.1% em relação à meta
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Matérias</CardTitle>
            <Library className="text-indigo-400" size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">4</div>
            <p className="text-xs text-zinc-500 mt-1">
              Ativas esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left/Center (span 2) and Right (span 1) */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Horas de Estudo (Progresso) */}
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-zinc-100">Horas de Estudo</CardTitle>
              <CardDescription className="text-zinc-400">Progresso da meta semanal (28 horas)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={46} className="h-2 bg-zinc-800 [&>div]:bg-indigo-500" />
              <div className="flex items-center gap-2 text-sm text-amber-500/90 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                <Info size={16} className="shrink-0" />
                Você está abaixo do ritmo ideal para atingir a meta. Intensifique!
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-zinc-500 italic w-full text-center">
                "Consistência é a chave. Todo esforço soma."
              </p>
            </CardFooter>
          </Card>

          {/* Horas por Dia (Gráfico) */}
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-zinc-100">Horas por Dia</CardTitle>
              <CardDescription className="text-zinc-400">Seu volume diário de estudo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyStudyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                    <Tooltip 
                      cursor={{fill: '#27272a'}} 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} 
                      itemStyle={{ color: '#e4e4e7' }}
                    />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                      {weeklyStudyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartTodayIndex ? '#4f46e5' : '#3f3f46'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-zinc-500 italic w-full text-center">
                "Números não mentem. Ataque suas fraquezas."
              </p>
            </CardFooter>
          </Card>

          {/* Desempenho por Matéria */}
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-zinc-100">Desempenho por Matéria</CardTitle>
              <CardDescription className="text-zinc-400">Resumo de questões e horas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subjectPerformance.map((subject) => (
                  <div key={subject.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50 gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{subject.name}</p>
                        <p className="text-xs text-zinc-500">{subject.questions} questões | {subject.hours}h estudadas</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg w-full sm:w-auto">
                      Detalhes
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          
          {/* Sugestões para Hoje */}
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-zinc-100">Sugestões para Hoje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-950/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-200">Direito Penal</span>
                  <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10 rounded-md px-2 py-0.5 text-xs">Prioridade</Badge>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">Você está há 3 dias sem revisar. Equilibre seu estudo.</p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-950/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-200">Constitucional</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">Desempenho abaixo de 70% em Controle de Const. Faça mais questões.</p>
              </div>
            </CardContent>
          </Card>

          {/* Estudo de Hoje (Donut Chart) */}
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-zinc-100">Estudo de Hoje</CardTitle>
              <CardDescription className="text-zinc-400">Distribuição de tempo</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {subjectsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} 
                      itemStyle={{ color: '#e4e4e7' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-full space-y-3 mt-4">
                {subjectsData.map(subject => (
                  <div key={subject.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
                      <span className="text-zinc-400">{subject.name}</span>
                    </div>
                    <span className="font-medium text-zinc-200">{subject.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progresso Anual */}
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-zinc-100">Progresso Anual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between pb-5 border-b border-zinc-800/50">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-zinc-400">Dias Estudados</span>
                  <span className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                    124 <Flame className="text-amber-500" size={20} />
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-zinc-400">Total de Horas</span>
                  <span className="text-2xl font-bold text-zinc-100">256h</span>
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
