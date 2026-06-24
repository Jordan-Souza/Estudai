"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { cn } from "@/lib/utils";

const FILTERS = ["Hoje", "Semana", "Mês", "Ano", "Tudo"];

const HOURS_BY_SUBJECT = [
  { name: "Direito Civil", value: 30, color: "#10b981" },
  { name: "Administrativo", value: 45, color: "#4f46e5" },
  { name: "Constitucional", value: 25, color: "#f59e0b" },
];

const COMPARISON_DATA = [
  { name: "Civil", hours: 0.8 },
  { name: "Admin.", hours: 1.2 },
  { name: "Constitucional", hours: 0.6 },
  { name: "Penal", hours: 0.3 },
  { name: "Matemática", hours: 0.9 },
];

export default function Desempenho() {
  const [activeFilter, setActiveFilter] = useState("Semana");

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
      
      {/* Header com Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Desempenho</h2>
          <p className="text-sm font-medium text-zinc-500 mt-1">
            {'< '} 22 de jun. - 28 de jun. {' >'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-1 bg-zinc-900/80 p-1.5 rounded-full border border-zinc-800/50 backdrop-blur-sm">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 min-h-[36px] sm:min-h-[44px]",
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
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 h-auto rounded-xl inline-flex min-w-max">
            <TabsTrigger value="horas" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400 py-2.5 px-6 min-h-[44px]">
              Horas Estudadas
            </TabsTrigger>
            <TabsTrigger value="questoes" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400 py-2.5 px-6 min-h-[44px]">
              Questões
            </TabsTrigger>
            <TabsTrigger value="assuntos" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400 py-2.5 px-6 min-h-[44px]">
              Por Assuntos
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="horas" className="space-y-6 mt-6">
          {/* Mini-cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Total Semana</p>
                <div className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-2">14h <span className="text-lg text-zinc-500">30m</span></div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Média Diária</p>
                <div className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-2">2h <span className="text-lg text-zinc-500">15m</span></div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Matérias</p>
                <div className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-2">4</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Registros</p>
                <div className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-2">12 <span className="text-lg text-zinc-500 font-normal">sessões</span></div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Horas por Matéria - Donut */}
            <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-zinc-100">Horas por Matéria</CardTitle>
                <CardDescription className="text-zinc-400">Distribuição semanal</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="h-[220px] w-full sm:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={HOURS_BY_SUBJECT}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {HOURS_BY_SUBJECT.map((entry, index) => (
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
                
                <div className="w-full sm:w-1/2 space-y-4">
                  {HOURS_BY_SUBJECT.map(subject => (
                    <div key={subject.name} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                        <span className="text-zinc-300 font-medium text-sm">{subject.name}</span>
                      </div>
                      <span className="text-md font-bold text-zinc-100">{subject.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comparativo por Matéria - BarChart */}
            <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-zinc-100">Comparativo</CardTitle>
                <CardDescription className="text-zinc-400">Tempo dedicado por disciplina</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={COMPARISON_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                      <Tooltip 
                        cursor={{fill: '#27272a'}} 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} 
                        itemStyle={{ color: '#e4e4e7' }}
                      />
                      <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="questoes" className="mt-6">
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl">
            <CardContent className="p-12 text-center text-zinc-500">
              Dados de questões não disponíveis (Mock).
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assuntos" className="mt-6">
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl">
            <CardContent className="p-12 text-center text-zinc-500">
              Dados de assuntos não disponíveis (Mock).
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
