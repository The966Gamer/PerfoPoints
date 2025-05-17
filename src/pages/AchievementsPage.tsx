
import { PageLayout } from "@/components/layout/PageLayout";
import { Achievements } from "@/components/user/Achievements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Medal, Trophy, Star, Calendar, ArrowUpCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AchievementsPage = () => {
  const { currentUser } = useAuth();
  
  return (
    <PageLayout requireAuth title="Your Achievements">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground">Track your progress and earn badges</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentUser?.points || 0}</div>
              <p className="text-xs text-muted-foreground">total earned</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Medal className="h-4 w-4 text-amber-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3/8</div>
              <p className="text-xs text-muted-foreground">unlocked</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-500" />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4 text-amber-500" />
                Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor((currentUser?.points || 0) / 50) + 1}</div>
              <p className="text-xs text-muted-foreground">based on points</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Achievements
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Star className="h-4 w-4" /> Badges
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="achievements" className="mt-6">
            <Achievements />
          </TabsContent>
          
          <TabsContent value="badges" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Special badges for completing unique challenges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    Complete more tasks to earn special badges!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievement History</CardTitle>
                <CardDescription>Your journey so far</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    Your achievement timeline will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AchievementsPage;
