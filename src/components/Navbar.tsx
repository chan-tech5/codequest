import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Code2, LogOut, User, Zap } from 'lucide-react';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary glow-green">
            <Code2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-gradient">CodeQuest</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/courses">
            <Button variant="ghost">Courses</Button>
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <Zap className="h-4 w-4 text-accent" />
                <span>Dashboard</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="cyber">Start Learning</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
