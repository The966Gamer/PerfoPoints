
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Award, 
  Medal, 
  Trophy, 
  Star
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function UserStats() {
  const { currentUser } = useAuth();
  const { tasks, pointRequests } = useData();
  
  if (!currentUser) return null;
  
  // Calculate user statistics
  const completedTasks = pointRequests.filter(req => 
    req.userId === currentUser.id && req.status === "approved"
  ).length;
  
  const pendingTasks = pointRequests.filter(req => 
    req.userId === currentUser.id && req.status === "pending"
  ).length;
  
  const availableTasks = tasks.length;
  
  // Calculate streak (mock data - would need actual daily login tracking)
  const streak = 3;
  
  // Calculate level
  const level = Math.floor(currentUser.points / 50) + 1;
  const nextLevelPoints = level * 50;
  const progress = Math.min(100, (currentUser.points / nextLevelPoints) * 100);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {completedTasks} / {availableTasks}
          </div>
          <p className="text-xs text-muted-foreground">tasks completed</p>
          
          <div className="mt-2">
            <Progress value={(completedTasks / Math.max(1, availableTasks)) * 100} className="h-1" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2 text-purple-500" />
            Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Level {level}
          </div>
          <p className="text-xs text-muted-foreground">
            {nextLevelPoints - currentUser.points} points to next level
          </p>
          
          <div className="mt-2">
            <Progress value={progress} className="h-1" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Award className="h-4 w-4 mr-2 text-green-500" />
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {streak}
          </div>
          <p className="text-xs text-muted-foreground">days in a row</p>
          
          <div className="mt-2 flex space-x-1">
            {Array.from({length: 7}).map((_, i) => (
              <div 
                key={i}
                className={`h-1 rounded-full flex-1 ${
                  i < streak ? 'bg-green-500' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            3
          </div>
          <p className="text-xs text-muted-foreground">unlocked</p>
          
          <div className="mt-2 flex space-x-1">
            <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Star className="h-3 w-3 text-yellow-500" />
            </div>
            <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Medal className="h-3 w-3 text-yellow-500" />
            </div>
            <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Trophy className="h-3 w-3 text-yellow-500" />
            </div>
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
