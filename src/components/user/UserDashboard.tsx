
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "./TaskCard";
import { RewardCard } from "./RewardCard";
import { Leaderboard } from "./Leaderboard";
import { CalendarCheck, Gift, Trophy } from "lucide-react";

export function UserDashboard() {
  const { currentUser } = useAuth();
  const { tasks, rewards } = useData();

  if (!currentUser) return null;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-center">
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center">
              {currentUser.points}
              <span className="ml-2 text-xl font-normal text-muted-foreground">points</span>
            </CardTitle>
            <CardDescription className="text-center">
              Complete tasks to earn more points!
            </CardDescription>
          </CardHeader>
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.length > 0 ? (
              tasks.map(task => <TaskCard key={task.id} task={task} />)
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.length > 0 ? (
              rewards.map(reward => <RewardCard key={reward.id} reward={reward} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <h3 className="text-lg font-medium mb-2">No rewards available</h3>
                <p className="text-muted-foreground">
                  Check back soon for rewards to redeem with your points
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
