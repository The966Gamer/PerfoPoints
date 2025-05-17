
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "./TaskCard";
import { RewardCard } from "./RewardCard";
import { Leaderboard } from "./Leaderboard";
import { CalendarCheck, Gift, Trophy, Sparkles, Medal, Award, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function UserDashboard() {
  const { currentUser } = useAuth();
  const { tasks, rewards } = useData();
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
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Badge variant="outline" className="text-xs">
              Keep it up!
            </Badge>
          </CardFooter>
          <div className="absolute -bottom-4 -right-4 opacity-20">
            <Award className="h-16 w-16 text-green-500" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" /> Tasks
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" /> Rewards
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
        
        <TabsContent value="leaderboard" className="mt-6">
          <Leaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
