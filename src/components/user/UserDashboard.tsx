import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "./task";
import { RewardCard } from "./RewardCard";
import { Leaderboard } from "./Leaderboard";
import { UserStats } from "./UserStats";
import { PremiumFeatures } from "./PremiumFeatures";
import { PrayerTracker } from "./PrayerTracker";
import { CalendarCheck, Gift, Trophy, Sparkles, Medal, Award, ArrowRight, Crown, Calendar, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CustomRequestFormDialog } from "./CustomRequestFormDialog";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export function UserDashboard() {
  const { currentUser } = useAuth();
  const { tasks, rewards, streak } = useData();
  const navigate = useNavigate();

  if (!currentUser) return null;

  // Calculate the next level threshold
  const currentLevel = Math.floor(currentUser.points / 50) + 1;
  const nextLevelPoints = currentLevel * 50;
  const progress = (currentUser.points / nextLevelPoints) * 100;

  // Get recent tasks and rewards
  const recentTasks = tasks.slice(0, 3);
  const affordableRewards = rewards
    .filter(reward => reward.pointCost <= currentUser.points)
    .slice(0, 3);
  
  // Generate some premium rewards
  const premiumRewards = rewards
    .filter(reward => reward.pointCost > currentUser.points * 0.8)
    .slice(0, 2)
    .map(reward => ({
      ...reward,
      category: "premium",
    }));

  // Add weekday tracking functionality for the planner
  const [today] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Array<{ day: string, date: Date, tasks: number }>>([]);
  
  // Generate the week days based on the current day
  useEffect(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert to 0 = Monday
    
    const weekDaysList = days.map((day, index) => {
      // Calculate the date for this weekday
      const date = new Date(today);
      date.setDate(today.getDate() - currentDayIndex + index);
      
      // Generate a random number of tasks for now (this would ideally come from real data)
      let taskCount = 0;
      if (day === 'Wed' || day === 'Fri') {
        taskCount = 1;
      } else if (day === 'Sat') {
        taskCount = 2;
      }
      
      return {
        day,
        date,
        tasks: taskCount,
        isToday: index === currentDayIndex
      };
    });
    
    setWeekDays(weekDaysList);
  }, [today]);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-1 sm:col-span-2 glass-card bg-gradient-to-br from-primary/20 to-background">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {currentUser.points}
                  <span className="ml-2 text-xl font-normal text-muted-foreground">points</span>
                </CardTitle>
                <CardDescription>
                  Level {currentLevel} • {nextLevelPoints - currentUser.points} points to next level
                </CardDescription>
              </div>
              <div className="flex">
                <Sparkles className="h-7 w-7 text-primary/80" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500/30 to-yellow-100/20 dark:from-yellow-500/20 dark:to-yellow-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-2xl font-bold">3/8</div>
            <p className="text-xs text-muted-foreground">unlocked</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-auto" 
              onClick={() => navigate("/achievements")}
            >
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardFooter>
          <div className="absolute -bottom-4 -right-4 opacity-20">
            <Medal className="h-16 w-16 text-yellow-500" />
          </div>
        </Card>
        
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/30 to-green-100/20 dark:from-green-500/20 dark:to-green-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="h-4 w-4 mr-2 text-green-500" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-2xl font-bold">{streak?.currentStreak || 0}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Badge variant="outline" className="text-xs">
              {streak?.currentStreak === 0 
                ? "Complete a task today!" 
                : streak?.currentStreak >= 5 
                  ? "Awesome streak!" 
                  : "Keep it up!"}
            </Badge>
          </CardFooter>
          <div className="absolute -bottom-4 -right-4 opacity-20">
            <Award className="h-16 w-16 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Prayer Tracker */}
      <PrayerTracker />

      {/* New detailed User Stats */}
      <UserStats />

      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => navigate("/requests")}>
            View My Requests
          </Button>
          <CustomRequestFormDialog buttonVariant="outline" defaultType="task" />
          <CustomRequestFormDialog buttonVariant="outline" defaultType="reward" />
        </div>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" /> Tasks
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" /> Rewards
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-2">
            <Crown className="h-4 w-4" /> Premium
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Available Tasks</h3>
            <Button variant="outline" size="sm" onClick={() => navigate("/tasks")}>
              View All Tasks
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentTasks.length > 0 ? (
              recentTasks.map(task => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <h3 className="text-lg font-medium mb-2">No tasks available</h3>
                <p className="text-muted-foreground">
                  Check back soon for new tasks to complete
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Rewards You Can Afford</h3>
            <Button variant="outline" size="sm" onClick={() => navigate("/rewards")}>
              View All Rewards
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {affordableRewards.length > 0 ? (
              affordableRewards.map(reward => <RewardCard key={reward.id} reward={reward} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <h3 className="text-lg font-medium mb-2">Keep earning points!</h3>
                <p className="text-muted-foreground">
                  You'll be able to redeem rewards once you earn enough points
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="premium" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium flex items-center">
                <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                Premium Rewards
              </h3>
              <Button variant="secondary" size="sm" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/30">
                View Premium Plan
              </Button>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {premiumRewards.map(reward => (
                <RewardCard key={reward.id} reward={reward} isPremium={true} />
              ))}
              <Card className="reward-card bg-gradient-to-br from-yellow-500/10 to-yellow-100/10 dark:from-yellow-500/10 dark:to-yellow-900/30 border-yellow-500/20 flex flex-col items-center justify-center p-6 text-center">
                <Crown className="h-10 w-10 text-yellow-500 mb-3" />
                <h3 className="font-medium text-lg mb-2">Unlock Premium</h3>
                <p className="text-sm text-muted-foreground mb-4">Get access to exclusive rewards and premium features</p>
                <Button variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/30">
                  Upgrade Now
                </Button>
              </Card>
            </div>
            
            {/* Premium Features Section */}
            <PremiumFeatures />
          </div>
        </TabsContent>
        
        <TabsContent value="leaderboard" className="mt-6">
          <Leaderboard />
        </TabsContent>
      </Tabs>

      {/* Weekly Calendar Preview with tracked days */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Weekly Task Planner
            </CardTitle>
            <Button variant="outline" size="sm">Full Calendar</Button>
          </div>
          <CardDescription>Plan your week with these upcoming tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((dayInfo) => (
              <div key={dayInfo.day} className="text-center">
                <div className={`font-medium ${dayInfo.isToday ? 'text-primary' : ''}`}>
                  {dayInfo.day}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(dayInfo.date, 'MMM d')}
                </div>
                <div className={`mt-2 h-20 border rounded-md ${
                  dayInfo.isToday ? 'bg-primary/10 border-primary/30' : 'bg-background/50'
                } flex items-center justify-center`}>
                  <div className="text-xs text-muted-foreground">
                    {dayInfo.tasks > 0 ? (
                      <div className={`${
                        dayInfo.tasks > 1 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-primary/10 text-primary'
                      } p-1 rounded`}>
                        {dayInfo.tasks} {dayInfo.tasks === 1 ? 'task' : 'tasks'}
                      </div>
                    ) : (
                      'No tasks'
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
