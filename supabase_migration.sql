-- Migration: Caderno de Erros Inteligente
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS error_notebook (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  original_question TEXT NOT NULL,
  user_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE error_notebook ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own error notebook."
  ON error_notebook FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_error_notebook_subject_id ON error_notebook(subject_id);
CREATE INDEX IF NOT EXISTS idx_error_notebook_user_id ON error_notebook(user_id);

-- Migration: Tabela de Respostas (Quiz)

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quiz attempts."
  ON quiz_attempts FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_subject_id ON quiz_attempts(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);

-- Migration: Adicionar tipo na tabela study_sessions para diferenciar Pomodoro de Cronômetro
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS tipo TEXT;

