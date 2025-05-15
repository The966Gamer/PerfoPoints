
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TaskCard } from "./TaskCard";
import { RewardCard } from "./RewardCard";
import { Progress } from "@/components/ui/progress";

export function UserDashboard() {
  const { currentUser } = useAuth();
  const { tasks, rewards, getUserTransactions } = useData();
  const navigate = useNavigate();
  
  if (!currentUser) return null;
  
  const userTransactions = getUserTransactions(currentUser.id).slice(0, 5);
  const featuredTasks = tasks.slice(0, 3);
  const featuredRewards = rewards.slice(0, 3);
  
  // Find the highest cost reward to show on progress
  const highestReward = rewards.reduce((max, reward) => 
    reward.pointCost > max.pointCost ? reward : max, 
    {pointCost: 0, title: "No rewards available"}
  );
  
  const progressPercentage = highestReward.pointCost > 0 
    ? Math.min(100, (currentUser.points / highestReward.pointCost) * 100)
    : 0;
    
  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Points</CardTitle>
            <CardDescription>Current point balance and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-6xl font-bold text-primary">{currentUser.points}</div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {highestReward.title}</span>
                <span>{currentUser.points} / {highestReward.pointCost}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest point transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {userTransactions.length > 0 ? (
              <ul className="space-y-2">
                {userTransactions.map((transaction) => (
                  <li key={transaction.id} className="flex justify-between items-center text-sm">
                    <span className="truncate mr-4">{transaction.description}</span>
                    <span className={`font-medium ${transaction.type === 'earned' ? 'text-success' : 'text-destructive'}`}>
                      {transaction.type === 'earned' ? '+' : ''}{transaction.amount}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted-foreground text-center py-8">
                No activity yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Available Tasks */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Available Tasks</h2>
          <Button variant="outline" onClick={() => navigate("/tasks")}>
            View All Tasks
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {featuredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
      
      {/* Available Rewards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Rewards Shop</h2>
          <Button variant="outline" onClick={() => navigate("/rewards")}>
            View All Rewards
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {featuredRewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      </div>
    </div>
  );
}
