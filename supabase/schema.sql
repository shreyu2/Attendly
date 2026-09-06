-- Attendly Database Schema for Supabase PostgreSQL
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  target_percentage NUMERIC(5, 2) DEFAULT 80.00 NOT NULL,
  semester TEXT DEFAULT 'Semester 5',
  department TEXT DEFAULT 'Computer Science & Engineering',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  target_percentage NUMERIC(5, 2) DEFAULT NULL, -- NULL means inherit global target
  credits NUMERIC(3, 1) DEFAULT 3.0,
  faculty TEXT,
  room TEXT,
  color TEXT DEFAULT 'primary',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Timetable Entries Table (Weekly Scheduled Classes)
CREATE TABLE IF NOT EXISTS public.timetable_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 6), -- 1 = Monday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  class_type TEXT NOT NULL DEFAULT 'Lecture', -- 'Lecture', 'Lab', 'Tutorial', 'Activity'
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Attendance Records Table (Actual Conducted Classes)
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  timetable_entry_id UUID REFERENCES public.timetable_entries(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, subject_id, timetable_entry_id, date)
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Subjects Policies
CREATE POLICY "Users can view own subjects" ON public.subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subjects" ON public.subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subjects" ON public.subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subjects" ON public.subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Timetable Entries Policies
CREATE POLICY "Users can view own timetable" ON public.timetable_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timetable" ON public.timetable_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timetable" ON public.timetable_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timetable" ON public.timetable_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Attendance Records Policies
CREATE POLICY "Users can view own attendance" ON public.attendance_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attendance" ON public.attendance_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance" ON public.attendance_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own attendance" ON public.attendance_records
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on auth.users signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, target_percentage)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Student'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    80.00
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
