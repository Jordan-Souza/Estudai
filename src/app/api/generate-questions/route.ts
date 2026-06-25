import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { subjectId, subjectName } = await request.json();

    if (!subjectId) {
      return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
    }

    // Buscar as últimas 10 questões do caderno de erros para essa matéria
    const supabase = createClient();
    const { data: questions, error: dbError } = await supabase
      .from("error_notebook")
      .select("original_question, user_notes")
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (dbError) throw dbError;
    if (!questions || questions.length < 5) {
      return NextResponse.json(
        { error: "Mínimo de 5 questões necessário para gerar inéditas." },
        { status: 400 }
      );
    }

    const questionsText = questions
      .map((q, i) => {
        let text = `QUESTÃO ${i + 1}:\n${q.original_question}`;
        if (q.user_notes) text += `\nOBSERVAÇÃO DO ALUNO: ${q.user_notes}`;
        return text;
      })
      .join("\n\n---\n\n");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `Você é um examinador sênior de bancas de concursos públicos de altíssimo nível (focado em carreiras fiscais, como Fiscal de Receitas, Auditor Fiscal, Analista Tributário). Analise as seguintes questões que o candidato errou na matéria "${subjectName}". Identifique as "pegadinhas", jurisprudências ou confusões conceituais que o levaram ao erro. Gere 10 novas questões inéditas de múltipla escolha (A, B, C, D, E) com o mesmo nível de complexidade e formato, focando cirurgicamente nas exatas fraquezas demonstradas.

REGRAS OBRIGATÓRIAS:
- Retorne APENAS um JSON válido, sem markdown, sem blocos de código, sem comentários externos.
- O JSON deve ter exatamente este formato:
{
  "questions": [
    {
      "id": 1,
      "question": "Enunciado completo da questão aqui.",
      "options": {
        "A": "Texto da opção A",
        "B": "Texto da opção B",
        "C": "Texto da opção C",
        "D": "Texto da opção D",
        "E": "Texto da opção E"
      },
      "correct_answer": "A",
      "explanation": "Comentário explicativo sobre a pegadinha e por que a alternativa correta está certa."
    }
  ]
}

QUESTÕES QUE O CANDIDATO ERROU:\n\n${questionsText}`;

    const result = await model.generateContent(systemPrompt);
    const rawText = result.response.text().trim();

    // Limpar possíveis blocos de markdown
    const cleanJson = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanJson);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Error generating questions:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao gerar questões" },
      { status: 500 }
    );
  }
}
