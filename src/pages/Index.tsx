import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { ArrowRight, Code2, Sparkles, Trophy, Users } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-secondary/20 blur-[120px]" />
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Learn to code the fun way</span>
            </div>
            
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
              Master <span className="text-gradient">Coding</span> Through Interactive Challenges
            </h1>
            
            <p className="mb-10 text-xl text-muted-foreground">
              Join thousands of learners building real skills with our gamified coding platform. 
              Write code, earn XP, and level up your programming journey.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl">
                  Start Learning Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="outline" size="xl">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Code Preview */}
          <div className="mt-20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-1 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <div className="h-3 w-3 rounded-full bg-accent" />
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="ml-2 font-mono text-sm text-muted-foreground">hello_world.py</span>
              </div>
              <pre className="p-6 text-left font-mono text-sm">
                <code>
                  <span className="text-secondary">def</span>{" "}
                  <span className="text-cyber-blue">greet</span>
                  <span className="text-foreground">(name):</span>
                  {"\n"}
                  <span className="text-muted-foreground">    # Your first function! 🎉</span>
                  {"\n"}
                  <span className="text-foreground">    </span>
                  <span className="text-secondary">return</span>{" "}
                  <span className="text-primary">f"Hello, </span>
                  <span className="text-foreground">{"{"}</span>
                  <span className="text-cyber-blue">name</span>
                  <span className="text-foreground">{"}"}</span>
                  <span className="text-primary">!"</span>
                  {"\n\n"}
                  <span className="text-cyber-blue">print</span>
                  <span className="text-foreground">(greet(</span>
                  <span className="text-primary">"World"</span>
                  <span className="text-foreground">))</span>
                </code>
              </pre>
              <div className="border-t border-border bg-muted/30 px-4 py-3 font-mono text-sm text-primary">
                → Hello, World!
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Code2 className="h-8 w-8" />}
              title="Interactive Editor"
              description="Write and run real code directly in your browser with instant feedback."
              color="primary"
            />
            <FeatureCard
              icon={<Trophy className="h-8 w-8" />}
              title="Earn XP & Badges"
              description="Complete challenges, earn experience points, and unlock achievements."
              color="accent"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Learn Together"
              description="Join a community of learners and share your coding journey."
              color="secondary"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-12 text-center">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="absolute top-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/30 blur-[80px]" />
            
            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ready to Start Your <span className="text-gradient">Coding Journey</span>?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Free to start. No credit card required.
              </p>
              <Link to="/auth?mode=signup">
                <Button variant="cyber" size="xl">
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 CodeQuest. Built for hackers, by hackers. 🚀</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: 'primary' | 'accent' | 'secondary';
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    secondary: 'bg-secondary/10 text-secondary',
  };
  
  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <div className={`mb-4 inline-flex rounded-lg p-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
