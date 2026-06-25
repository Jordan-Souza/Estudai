"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Erro ao fazer login", {
          description: error.message,
        });
        return;
      }

      toast.success("Login realizado com sucesso!", {
        description: "Redirecionando para a dashboard...",
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error("Erro inesperado", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split("@")[0], // Mock initial name
          },
        },
      });

      if (error) {
        toast.error("Erro ao criar conta", {
          description: error.message,
        });
        return;
      }

      toast.success("Conta criada!", {
        description: "Você já pode acessar o sistema.",
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error("Erro inesperado", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
              <span className="text-2xl text-indigo-500 font-bold">◆</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-100">Bem-vindo ao EstudAI</CardTitle>
          <CardDescription className="text-zinc-400">
            Acesse ou crie sua conta para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
                required
              />
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                onClick={handleLogin}
                disabled={isLoading || !email || !password}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Entrar
              </Button>
              <Button
                type="button"
                onClick={handleSignUp}
                disabled={isLoading || !email || !password}
                variant="outline"
                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 h-11"
              >
                Criar Conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
