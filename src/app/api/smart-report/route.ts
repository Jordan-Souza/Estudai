import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { body } = await request.json().catch(() => ({ body: {} }));

    // Calcular data limite (7 dias atrás)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const limitDate = sevenDaysAgo.toISOString();

    // Buscar "erros recorrentes"
    const { data: errors, error: dbError } = await supabase
      .from("quiz_attempts")
      .select("subject_id, question_text, subjects(name)")
      .eq("user_id", user.id)
      .eq("is_correct", false)
      .gte("created_at", limitDate);

    if (dbError) throw dbError;

    if (!errors || errors.length === 0) {
      return NextResponse.json({ 
        roadmap: [], 
        message: "Nenhum erro registrado nos últimos 7 dias. Excelente trabalho!" 
      });
    }

    // Agrupar erros por matéria
    const errorsBySubject = errors.reduce((acc, curr: any) => {
      const subjectName = curr.subjects?.name || "Geral";
      if (!acc[subjectName]) acc[subjectName] = [];
      acc[subjectName].push(curr.question_text);
      return acc;
    }, {} as Record<string, string[]>);

    let promptContent = "Erros Recorrentes do Aluno nos últimos 7 dias:\n\n";
    for (const [subject, questions] of Object.entries(errorsBySubject)) {
      promptContent += `Matéria: ${subject}\nQuestões Erradas:\n`;
      questions.forEach((q, i) => promptContent += `${i + 1}. ${q}\n`);
      promptContent += "\n";
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `Você é um mentor implacável de estudos para concursos de alto nível. Analise a seguinte lista de questões que o aluno ERROU REPETIDAMENTE (dupla falha). Sua tarefa é criar um 'Roadmap de Correção de Rota' prático e direto ao ponto. Separe o roadmap por Matéria/Assunto. Para cada assunto onde houve erro, forneça: 1) O 'Ponto Cego' (qual conceito base ele não entendeu), 2) Ação Imediata (ex: 'Revisar Artigo X da Lei Y', 'Refazer 10 questões do tema Z'), 3) Um mnemônico ou gatilho mental exclusivo para ele nunca mais esquecer este conceito. Retorne em formato JSON estruturado EXATAMENTE como um array de objetos: [ { "subject": "Nome", "topic": "Tópico", "blind_spot": "Ponto cego", "action_plan": "Ação", "mnemonic": "Mnemônico" } ]
Não inclua crases markdown como \`\`\`json no começo ou fim, responda APENAS o JSON.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: promptContent }
    ]);

    let responseText = result.response.text();
    // Limpar o texto caso o modelo retorne com as crases (mesmo pedindo para não retornar)
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    const roadmap = JSON.parse(responseText);

    return NextResponse.json({ roadmap });
  } catch (error: any) {
    console.error("Smart Report error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar o relatório inteligente. Tente novamente." },
      { status: 500 }
    );
  }
}
