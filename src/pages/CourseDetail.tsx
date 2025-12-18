import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, CheckCircle2, Circle, Loader2, Lock, Play } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  language: string;
}

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string;
  order_index: number;
  xp_reward: number;
}

interface Progress {
  lesson_id: string;
  completed: boolean;
}

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      // Fetch course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (courseData) {
        setCourse(courseData);

        // Fetch lessons
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseData.id)
          .order('order_index');

        if (lessonsData) {
          setLessons(lessonsData);
        }

        // Fetch progress if logged in
        if (user) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id);

          if (progressData) {
            setProgress(progressData);
          }
        }
      }

      setLoading(false);
    };

    fetchCourseData();
  }, [slug, user]);

  const isLessonCompleted = (lessonId: string) => {
    return progress.some((p) => p.lesson_id === lessonId && p.completed);
  };

  const completedCount = lessons.filter((l) => isLessonCompleted(l.id)).length;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Course Header */}
        <div className="mb-12 rounded-xl border border-border bg-card p-8">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted text-4xl">
              {course.icon}
            </div>
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>
              <p className="mb-4 text-muted-foreground">{course.description}</p>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div 
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {completedCount}/{lessons.length} completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="mb-6 text-xl font-semibold">Lessons</h2>
          
          {lessons.map((lesson, index) => {
            const isCompleted = isLessonCompleted(lesson.id);
            const isLocked = !user && index > 0;
            
            return (
              <Link
                key={lesson.id}
                to={isLocked ? '#' : `/courses/${slug}/lessons/${lesson.slug}`}
                className={`block ${isLocked ? 'pointer-events-none' : ''}`}
              >
                <div className={`group flex items-center gap-4 rounded-lg border p-4 transition-all duration-200 ${
                  isCompleted 
                    ? 'border-primary/30 bg-primary/5' 
                    : isLocked
                    ? 'border-border bg-muted/30 opacity-60'
                    : 'border-border bg-card hover:border-primary/50 hover:shadow-md hover:shadow-primary/5'
                }`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : isLocked
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground'
                  } transition-colors`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <span className="font-mono text-sm">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-accent/20 px-2 py-1 text-xs font-medium text-accent">
                      +{lesson.xp_reward} XP
                    </span>
                    {!isLocked && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!user && (
          <div className="mt-8 rounded-lg border border-primary/30 bg-primary/5 p-6 text-center">
            <p className="mb-4 text-muted-foreground">
              Sign up to track your progress and unlock all lessons
            </p>
            <Link to="/auth?mode=signup">
              <Button variant="cyber">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseDetail;
