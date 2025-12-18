import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, BookOpen, CheckCircle2, Loader2, Zap } from 'lucide-react';

interface Profile {
  username: string | null;
  total_xp: number;
  streak_days: number;
}

interface CourseProgress {
  course: {
    id: string;
    title: string;
    slug: string;
    icon: string;
  };
  completed: number;
  total: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, total_xp, streak_days')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch courses with progress
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, slug, icon');

      if (courses) {
        const progressPromises = courses.map(async (course) => {
          // Get total lessons for course
          const { data: lessons } = await supabase
            .from('lessons')
            .select('id')
            .eq('course_id', course.id);

          // Get completed lessons for user
          const { data: completed } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('completed', true)
            .in('lesson_id', lessons?.map(l => l.id) || []);

          return {
            course,
            completed: completed?.length || 0,
            total: lessons?.length || 0,
          };
        });

        const progress = await Promise.all(progressPromises);
        setCourseProgress(progress);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            Welcome back, <span className="text-gradient">{profile?.username || 'Coder'}</span>!
          </h1>
          <p className="text-muted-foreground">Continue your coding journey</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Zap className="h-5 w-5 text-accent" />
              <span>Total XP</span>
            </div>
            <p className="text-3xl font-bold">{profile?.total_xp || 0}</p>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Lessons Completed</span>
            </div>
            <p className="text-3xl font-bold">
              {courseProgress.reduce((acc, cp) => acc + cp.completed, 0)}
            </p>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-5 w-5 text-secondary" />
              <span>Courses Started</span>
            </div>
            <p className="text-3xl font-bold">
              {courseProgress.filter(cp => cp.completed > 0).length}
            </p>
          </div>
        </div>

        {/* Course Progress */}
        <h2 className="mb-6 text-xl font-semibold">Your Progress</h2>
        <div className="space-y-4">
          {courseProgress.map(({ course, completed, total }) => {
            const percent = total > 0 ? (completed / total) * 100 : 0;
            
            return (
              <Link key={course.id} to={`/courses/${course.slug}`}>
                <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{course.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div 
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {completed}/{total}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {courseProgress.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <h3 className="mb-2 text-lg font-medium">No courses started yet</h3>
            <p className="mb-6 text-muted-foreground">Begin your coding journey today!</p>
            <Link to="/courses">
              <Button variant="cyber">
                Browse Courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
