-- Setup inicial do EstudAI (Supabase)

-- Habilitar a extensão "uuid-ossp" se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile."
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Tabela subjects (Matérias/Disciplinas)
CREATE TABLE subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subjects."
  ON subjects FOR ALL
  USING (auth.uid() = user_id);

-- 3. Tabela study_sessions (Sessões de Estudo / Pomodoros)
CREATE TABLE study_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  date_log DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own study sessions."
  ON study_sessions FOR ALL
  USING (auth.uid() = user_id);

-- 4. Tabela schedule_tasks (Cronograma/Tarefas)
CREATE TABLE schedule_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE schedule_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own schedule tasks."
  ON schedule_tasks FOR ALL
  USING (auth.uid() = user_id);

-- Trigger para criar um profile automaticamente quando um usuário se cadastrar no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_premium)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário ' || new.id), false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
