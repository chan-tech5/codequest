-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '📚',
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  starter_code TEXT DEFAULT '',
  expected_output TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, slug)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress table
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  code_submitted TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Courses: public read
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

-- Lessons: public read
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);

-- Profiles: users can manage their own
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Progress: users manage their own
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data ->> 'username');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample courses
INSERT INTO public.courses (title, description, slug, icon, difficulty, language) VALUES
('Python Fundamentals', 'Master the basics of Python programming', 'python-fundamentals', '🐍', 'beginner', 'python'),
('JavaScript Essentials', 'Learn JavaScript from scratch', 'javascript-essentials', '⚡', 'beginner', 'javascript'),
('Data Structures', 'Essential data structures for coding interviews', 'data-structures', '🏗️', 'intermediate', 'python');

-- Insert sample lessons for Python course
INSERT INTO public.lessons (course_id, title, slug, description, content, starter_code, expected_output, order_index, xp_reward)
SELECT 
  c.id,
  'Hello World',
  'hello-world',
  'Write your first Python program',
  E'# Welcome to Python! 🐍\n\nLet''s write your first program. In Python, we use the `print()` function to display text.\n\n## Your Task\nModify the code to print "Hello, World!" to the console.',
  E'# Write your code below\nprint("Hello")',
  'Hello, World!',
  1,
  10
FROM public.courses c WHERE c.slug = 'python-fundamentals';

INSERT INTO public.lessons (course_id, title, slug, description, content, starter_code, expected_output, order_index, xp_reward)
SELECT 
  c.id,
  'Variables',
  'variables',
  'Learn about Python variables',
  E'# Variables in Python 📦\n\nVariables store data values. Python has no command for declaring a variable.\n\n## Your Task\nCreate a variable called `name` and set it to your name, then print it.',
  E'# Create a variable and print it\nname = ""\nprint(name)',
  NULL,
  2,
  15
FROM public.courses c WHERE c.slug = 'python-fundamentals';

INSERT INTO public.lessons (course_id, title, slug, description, content, starter_code, expected_output, order_index, xp_reward)
SELECT 
  c.id,
  'Math Operations',
  'math-operations',
  'Perform basic math in Python',
  E'# Math Operations ➕➖✖️➗\n\nPython supports all basic math operations.\n\n## Your Task\nCalculate and print the result of 42 + 8.',
  E'# Calculate 42 + 8\nresult = 0\nprint(result)',
  '50',
  3,
  15
FROM public.courses c WHERE c.slug = 'python-fundamentals';