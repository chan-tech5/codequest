import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/CodeEditor';
import { OutputConsole } from '@/components/OutputConsole';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Loader2, 
  Play, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  starter_code: string;
  expected_output: string | null;
  order_index: number;
  xp_reward: number;
}

interface Course {
  slug: string;
  title: string;
  language: string;
}

const Lesson = () => {
  const { courseSlug, lessonSlug } = useParams<{ courseSlug: string; lessonSlug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonData = async () => {
      // Fetch course
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, slug, title, language')
        .eq('slug', courseSlug)
        .single();

      if (courseData) {
        setCourse(courseData);

        // Fetch all lessons for navigation
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseData.id)
          .order('order_index');

        if (lessonsData) {
          setAllLessons(lessonsData);
          
          // Find current lesson
          const currentLesson = lessonsData.find(l => l.slug === lessonSlug);
          if (currentLesson) {
            setLesson(currentLesson);
            setCode(currentLesson.starter_code || '');
            
            // Check if completed
            if (user) {
              const { data: progressData } = await supabase
                .from('user_progress')
                .select('completed')
                .eq('user_id', user.id)
                .eq('lesson_id', currentLesson.id)
                .single();

              if (progressData?.completed) {
                setIsCompleted(true);
              }
            }
          }
        }
      }
      setLoading(false);
    };

    fetchLessonData();
  }, [courseSlug, lessonSlug, user]);

  const currentIndex = allLessons.findIndex(l => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      // Call edge function for code execution
      const { data, error } = await supabase.functions.invoke('execute-code', {
        body: { code, language: course?.language || 'python' }
      });

      if (error) throw error;

      const result = data.output || data.error || 'No output';
      setOutput(result);

      // Check if output matches expected
      if (lesson?.expected_output && result.trim() === lesson.expected_output.trim()) {
        handleSuccess();
      }
    } catch (error) {
      setOutput('Error executing code. Please try again.');
      console.error('Execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSuccess = async () => {
    if (!user || !lesson || isCompleted) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          completed: true,
          code_submitted: code,
          completed_at: new Date().toISOString(),
        });

      if (!error) {
        setIsCompleted(true);
        toast.success(`+${lesson.xp_reward} XP earned! 🎉`);
      }
    } catch (error) {
      console.error('Progress save error:', error);
    }
  };

  const resetCode = () => {
    if (lesson) {
      setCode(lesson.starter_code || '');
      setOutput('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Lesson not found</h1>
          <Link to="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to={`/courses/${courseSlug}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              <span className="font-medium">{course.title}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{lesson.title}</span>
            </div>
          </div>
          
          {isCompleted && (
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-screen pt-14">
        {/* Left Panel - Instructions */}
        <div className="w-1/2 overflow-auto border-r border-border p-6">
          <div className="mx-auto max-w-xl">
            <div className="mb-6">
              <span className="mb-2 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                Lesson {currentIndex + 1}
              </span>
              <h1 className="mb-2 text-2xl font-bold">{lesson.title}</h1>
              <p className="text-muted-foreground">{lesson.description}</p>
            </div>

            {/* Markdown Content */}
            <div className="prose prose-invert max-w-none">
              {lesson.content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) {
                  return <h2 key={i} className="text-xl font-bold text-foreground">{line.slice(2)}</h2>;
                } else if (line.startsWith('## ')) {
                  return <h3 key={i} className="text-lg font-semibold text-foreground mt-6 mb-2">{line.slice(3)}</h3>;
                } else if (line.startsWith('- ')) {
                  return <li key={i} className="text-muted-foreground ml-4">{line.slice(2)}</li>;
                } else if (line.includes('`')) {
                  const parts = line.split('`');
                  return (
                    <p key={i} className="text-muted-foreground">
                      {parts.map((part, j) => 
                        j % 2 === 1 ? (
                          <code key={j} className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">
                            {part}
                          </code>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  );
                } else if (line.trim()) {
                  return <p key={i} className="text-muted-foreground">{line}</p>;
                }
                return null;
              })}
            </div>

            {lesson.expected_output && (
              <div className="mt-8 rounded-lg border border-border bg-card p-4">
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Expected Output</h4>
                <code className="font-mono text-primary">{lesson.expected_output}</code>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex w-1/2 flex-col p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-3 py-1 font-mono text-sm uppercase">
                {course.language}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={resetCode}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="flex-1">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={course.language}
              height="calc(100vh - 380px)"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <Button 
              onClick={runCode} 
              disabled={isRunning}
              variant="cyber"
              className="flex-1"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Code
                </>
              )}
            </Button>
          </div>

          <div className="mt-4">
            <OutputConsole 
              output={output} 
              isLoading={isRunning}
              isSuccess={isCompleted || (lesson.expected_output && output.trim() === lesson.expected_output.trim())}
              isError={output.toLowerCase().includes('error')}
            />
          </div>

          {/* Navigation */}
          <div className="mt-4 flex items-center justify-between">
            {prevLesson ? (
              <Link to={`/courses/${courseSlug}/lessons/${prevLesson.slug}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              </Link>
            ) : (
              <div />
            )}
            
            {nextLesson ? (
              <Link to={`/courses/${courseSlug}/lessons/${nextLesson.slug}`}>
                <Button variant="outline" size="sm">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to={`/courses/${courseSlug}`}>
                <Button variant="cyber" size="sm">
                  <Sparkles className="h-4 w-4" />
                  Complete Course
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
