import { createClient } from "@/lib/supabase/client";

export type StudySession = {
  id: string;
  subject_id: string;
  duration_minutes: number;
  date_log: string;
  subjects: { name: string; color_hex: string } | null;
};

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function getDateRange(filter: string): { start: string; end: string } {
  const now = new Date();
  const pad = (d: Date) => d.toISOString().split("T")[0];

  if (filter === "Hoje") {
    return { start: pad(now), end: pad(now) };
  }
  if (filter === "Semana") {
    const day = now.getDay();
    const mon = new Date(now);
    mon.setDate(now.getDate() - ((day + 6) % 7));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { start: pad(mon), end: pad(sun) };
  }
  if (filter === "Mês") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: pad(start), end: pad(end) };
  }
  if (filter === "Ano") {
    return {
      start: `${now.getFullYear()}-01-01`,
      end: `${now.getFullYear()}-12-31`,
    };
  }
  // Tudo
  return { start: "2020-01-01", end: pad(now) };
}

export function aggregateBySubject(sessions: StudySession[]) {
  const map: Record<string, { name: string; color: string; minutes: number }> = {};
  sessions.forEach((s, idx) => {
    const sid = s.subject_id;
    if (!map[sid]) {
      map[sid] = {
        name: s.subjects?.name ?? "Sem nome",
        color: s.subjects?.color_hex ?? COLORS[idx % COLORS.length],
        minutes: 0,
      };
    }
    map[sid].minutes += s.duration_minutes;
  });
  return Object.values(map).map((v) => ({
    name: v.name,
    color: v.color,
    hours: parseFloat((v.minutes / 60).toFixed(1)),
    value: v.minutes,
  }));
}

export function aggregateByDay(sessions: StudySession[]) {
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const map: Record<string, number> = {};
  sessions.forEach((s) => {
    const day = new Date(s.date_log + "T12:00:00").getDay();
    const key = dayNames[day];
    map[key] = (map[key] || 0) + s.duration_minutes;
  });
  return dayNames.map((name) => ({
    name,
    hours: parseFloat(((map[name] || 0) / 60).toFixed(1)),
  }));
}

export async function fetchSessionsForRange(filter: string) {
  const supabase = createClient();
  const { start, end } = getDateRange(filter);
  const { data, error } = await supabase
    .from("study_sessions")
    .select("id, subject_id, duration_minutes, date_log, subjects(name, color_hex)")
    .gte("date_log", start)
    .lte("date_log", end)
    .order("date_log", { ascending: true });

  return { sessions: (data as StudySession[]) || [], error };
}

export type QuizAttempt = {
  id: string;
  subject_id: string;
  is_correct: boolean;
  created_at: string;
};

export async function fetchQuizAttemptsForRange(filter: string) {
  const supabase = createClient();
  const { start, end } = getDateRange(filter);
  
  // Set end to 23:59:59 to include the whole day
  const endDateTime = `${end}T23:59:59Z`;
  
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("id, subject_id, is_correct, created_at")
    .gte("created_at", `${start}T00:00:00Z`)
    .lte("created_at", endDateTime);

  return { attempts: (data as QuizAttempt[]) || [], error };
}
