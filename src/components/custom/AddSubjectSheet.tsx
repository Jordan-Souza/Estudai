"use client";

import { useState } from "react";
import { Loader2, Palette } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESET_COLORS = [
  "#4f46e5", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#ec4899", // Pink
  "#84cc16", // Lime
  "#64748b", // Slate
];

type AddSubjectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onSubjectAdded: (subject: { id: string; name: string; color_hex: string }) => void;
};

export function AddSubjectSheet({
  open,
  onOpenChange,
  userId,
  onSubjectAdded,
}: AddSubjectSheetProps) {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError("O nome da matéria é obrigatório.");
      return;
    }
    if (!userId) {
      toast.error("Você precisa estar logado.");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("subjects")
        .insert({ user_id: userId, name: name.trim(), color_hex: selectedColor })
        .select()
        .single();

      if (error) throw error;

      toast.success("Matéria criada!", {
        description: `"${name.trim()}" foi adicionada com sucesso.`,
      });

      onSubjectAdded(data);
      setName("");
      setSelectedColor(PRESET_COLORS[0]);
      setNameError("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Erro ao criar matéria", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] rounded-t-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nova Matéria</SheetTitle>
          <SheetDescription>
            Crie uma nova matéria para organizar seus estudos.
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Nome da Matéria
            </Label>
            <Input
              placeholder="Ex: Direito Civil, Matemática..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className={cn(
                "h-12 rounded-xl bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600",
                nameError && "border-red-500/50 focus-visible:ring-red-500/50"
              )}
              autoFocus
            />
            {nameError && (
              <p className="text-xs text-red-400">{nameError}</p>
            )}
          </div>

          {/* Cor */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Palette size={14} />
              Cor de Identificação
            </Label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
                    selectedColor === color
                      ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110"
                      : "opacity-70 hover:opacity-100"
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50 mt-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="text-sm font-medium text-zinc-200">
                {name.trim() || "Nome da Matéria"}
              </span>
              <span className="text-xs text-zinc-500 ml-auto">Pré-visualização</span>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 rounded-xl h-12 flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-12 flex-1"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
            ) : (
              "Criar Matéria"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
