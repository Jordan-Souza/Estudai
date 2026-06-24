"use client";

import { PremiumBlocker } from "@/components/custom/PremiumBlocker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const MOCK_DATA = [
  { name: "S1", pontos: 120 },
  { name: "S2", pontos: 200 },
  { name: "S3", pontos: 150 },
  { name: "S4", pontos: 310 },
];

export default function RelatorioSemanal() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Relatório Inteligente</h2>
        <p className="text-zinc-400 mt-1">Sua inteligência artificial que destrincha sua semana.</p>
      </div>

      <PremiumBlocker>
        <div className="grid gap-6 md:grid-cols-2 p-4 md:p-6">
          <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-zinc-100">Pontos Ganhos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_DATA}>
                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <Bar dataKey="pontos" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800/50 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-zinc-100">Comentário da IA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-300 leading-relaxed">
                Você teve um aumento de <strong className="text-indigo-400">40%</strong> na resolução de questões em relação à semana passada. Sua taxa de retenção em Direito Constitucional, no entanto, caiu para 68%. 
                <br/><br/>
                Recomendamos criar flashcards focados em Controle de Constitucionalidade.
              </p>
            </CardContent>
          </Card>
        </div>
      </PremiumBlocker>
    </div>
  );
}
