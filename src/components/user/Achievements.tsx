
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Achievement } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Medal, Award, Gift, Shield } from 'lucide-react';

export function Achievements() {
  const { currentUser } = useAuth();
  const { tasks, requests } = useData();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  useEffect(() => {
    if (!currentUser) return;
    
    // Calculate the number of completed tasks
    const completedTasks = requests.filter(
      req => req.userId === currentUser.id && req.status === 'approved'
    ).length;
    
    // Get total points earned
    const totalPoints = currentUser.points || 0;
    
    // Define achievements based on user progress
    const userAchievements: Achievement[] = [
      {
        id: 'first-task',
        title: 'First Step',
        description: 'Complete your first task',
        icon: 'Trophy',
        pointsRequired: 1,
        achieved: completedTasks >= 1
      },
      {
        id: 'task-master',
        title: 'Task Master',
        description: 'Complete 5 tasks',
        icon: 'Medal',
        pointsRequired: 5,
        achieved: completedTasks >= 5
      },
      {
        id: 'super-achiever',
        title: 'Super Achiever',
        description: 'Complete 10 tasks',
        icon: 'Award',
        pointsRequired: 10,
        achieved: completedTasks >= 10
      },
      {
        id: 'point-collector-10',
        title: 'Point Collector',
        description: 'Earn 10 points',
        icon: 'Star',
        pointsRequired: 10,
        achieved: totalPoints >= 10
      },
      {
        id: 'point-collector-50',
        title: 'Point Hunter',
        description: 'Earn 50 points',
        icon: 'Star',
        pointsRequired: 50,
        achieved: totalPoints >= 50
      },
      {
        id: 'point-collector-100',
        title: 'Point Master',
        description: 'Earn 100 points',
        icon: 'Star',
        pointsRequired: 100,
        achieved: totalPoints >= 100
      },
      {
        id: 'reward-collector',
        title: 'Reward Collector',
        description: 'Redeem your first reward',
        icon: 'Gift',
        pointsRequired: 1,
        achieved: false // Would need redemption history to track this
      },
      {
        id: 'perfect-streak',
        title: 'Perfect Streak',
        description: 'Complete tasks for 5 days in a row',
        icon: 'Shield',
        pointsRequired: 5,
        achieved: false // Would need streak tracking to implement this
      }
    ];
    
    setAchievements(userAchievements);
  }, [currentUser, tasks, requests]);
  
  const achievedCount = achievements.filter(a => a.achieved).length;
  const totalAchievements = achievements.length;
  const achievementProgress = (achievedCount / totalAchievements) * 100;
  
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Trophy': return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'Star': return <Star className="h-6 w-6 text-yellow-500" />;
      case 'Medal': return <Medal className="h-6 w-6 text-yellow-500" />;
      case 'Award': return <Award className="h-6 w-6 text-purple-500" />;
      case 'Gift': return <Gift className="h-6 w-6 text-blue-500" />;
      case 'Shield': return <Shield className="h-6 w-6 text-green-500" />;
      default: return <Trophy className="h-6 w-6 text-yellow-500" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            Track your progress and unlock special badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{achievedCount} / {totalAchievements}</span>
            </div>
            <Progress value={achievementProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className={`
            transition-all duration-300 
            ${achievement.achieved 
              ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20' 
              : 'opacity-70'}
          `}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium">{achievement.title}</CardTitle>
                {getIconComponent(achievement.icon)}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </CardContent>
            <CardFooter>
              {achievement.achieved ? (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Achieved
                </Badge>
              ) : (
                <Badge variant="outline">In Progress</Badge>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Achievements;
