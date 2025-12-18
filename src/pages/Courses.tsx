import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  icon: string;
  difficulty: string;
  language: string;
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at');
      
      if (!error && data) {
        setCourses(data);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const difficultyColors = {
    beginner: 'bg-primary/20 text-primary',
    intermediate: 'bg-accent/20 text-accent',
    advanced: 'bg-secondary/20 text-secondary',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">
            Choose Your <span className="text-gradient">Path</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Pick a course and start your coding adventure
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <Link 
                key={course.id} 
                to={`/courses/${course.slug}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-4xl">{course.icon}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${difficultyColors[course.difficulty as keyof typeof difficultyColors]}`}>
                      {course.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="mb-4 text-sm text-muted-foreground">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span className="uppercase">{course.language}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:text-primary">
                      Start
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
