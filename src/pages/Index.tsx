
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">PerfoPoints</h1>
          <div>
            {currentUser ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/auth">Login / Register</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl">
              The Family Reward System
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              A simple, fair, and fun way to track chores, rewards, and points for the entire family.
            </p>
            <div className="mt-10">
              {currentUser ? (
                <Button asChild size="lg">
                  <Link to="/dashboard">My Dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link to="/auth">Get Started</Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center p-6">
                <div className="mx-auto bg-primary/10 w-12 h-12 mb-4 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 22L3 17V7l9-5l9 5v10l-9 5Z"></path><path d="m12 22 9-5"></path><path d="m12 17-9-5"></path><path d="M12 7v10"></path><path d="m12 7 9-5"></path><path d="M9 4.8 3 7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium">Track Tasks</h3>
                <p className="mt-2 text-muted-foreground">
                  Easily manage chores and responsibilities for all family members.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="mx-auto bg-primary/10 w-12 h-12 mb-4 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="8"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium">Earn Points</h3>
                <p className="mt-2 text-muted-foreground">
                  Complete tasks to earn points that can be redeemed for rewards.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="mx-auto bg-primary/10 w-12 h-12 mb-4 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-medium">Get Rewards</h3>
                <p className="mt-2 text-muted-foreground">
                  Redeem points for customized rewards chosen by parents.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} PerfoPoints. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
