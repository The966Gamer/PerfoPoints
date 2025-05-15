
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1">
              <div className="text-primary-foreground font-bold">PP</div>
            </div>
            <span className="font-bold text-xl">Perfo Points</span>
          </div>
          
          {currentUser ? (
            <Link to="/dashboard">
              <Button>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button>
                Log In
              </Button>
            </Link>
          )}
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="py-20 px-4">
          <div className="container max-w-5xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Make chores fun with Perfo Points!
            </h1>
            <p className="text-xl max-w-2xl mx-auto mb-10 text-muted-foreground">
              A family reward system that makes it easy to track tasks, earn points, and redeem rewards.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <Link to="/dashboard">
                  <Button size="lg" className="px-8">
                    Go to Your Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button size="lg" className="px-8">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-muted/50">
          <div className="container max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background p-6 rounded-xl shadow-sm text-center">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Complete Tasks</h3>
                <p className="text-muted-foreground">
                  Children complete assigned tasks and chores from their task list.
                </p>
              </div>
              
              <div className="bg-background p-6 rounded-xl shadow-sm text-center">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Earn Points</h3>
                <p className="text-muted-foreground">
                  Parents approve completed tasks and children earn points for their work.
                </p>
              </div>
              
              <div className="bg-background p-6 rounded-xl shadow-sm text-center">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Redeem Rewards</h3>
                <p className="text-muted-foreground">
                  Children spend their points on rewards created by parents.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 px-4">
          <div className="container max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Perfect for Families</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-accent flex-shrink-0 p-1">
                  <svg className="w-5 h-5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Teaches Responsibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Children learn responsibility by completing assigned tasks.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-accent flex-shrink-0 p-1">
                  <svg className="w-5 h-5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Builds Work Ethic</h3>
                  <p className="text-sm text-muted-foreground">
                    Kids learn the connection between work and rewards.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-accent flex-shrink-0 p-1">
                  <svg className="w-5 h-5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Encourages Saving</h3>
                  <p className="text-sm text-muted-foreground">
                    Children learn to save points for bigger rewards.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-accent flex-shrink-0 p-1">
                  <svg className="w-5 h-5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Makes Chores Fun</h3>
                  <p className="text-sm text-muted-foreground">
                    Gamified system makes mundane tasks engaging.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <Link to="/login">
                <Button size="lg" className="px-8">
                  Try It For Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Perfo Points. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
