
import { useAuth } from "@/context/AuthContext";
import { useActiveUserMeter, useMeterHistory } from "@/hooks/data/useUserMeters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gauge, Trophy, History, Calendar, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export function UserMeterDisplay() {
  const { currentUser } = useAuth();
  const { data: activeMeter, isLoading } = useActiveUserMeter(currentUser?.id || "");
  const { data: meterHistory } = useMeterHistory(activeMeter?.id || "");

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-100/10 dark:from-blue-500/10 dark:to-blue-900/30 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-blue-500" />
            Loading Progress Meter...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={0} className="h-3" />
        </CardContent>
      </Card>
    );
  }

  if (!activeMeter) {
    return (
      <Card className="bg-gradient-to-br from-gray-500/10 to-gray-100/10 dark:from-gray-500/10 dark:to-gray-900/30 border-gray-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-gray-500" />
            No Active Progress Meter
          </CardTitle>
          <CardDescription>
            Ask an admin to create a progress meter for you to start tracking your achievements!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 bg-gray-500/10 rounded-lg border border-gray-500/20">
            <Gauge className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Progress meters help you track your journey towards prizes and achievements.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = (activeMeter.currentPercentage / activeMeter.targetPercentage) * 100;
  const isCompleted = activeMeter.currentPercentage >= activeMeter.targetPercentage;

  return (
    <Card className={`relative overflow-hidden ${isCompleted ? 'bg-gradient-to-br from-green-500/10 to-green-100/10 dark:from-green-500/10 dark:to-green-900/30 border-green-500/20' : 'bg-gradient-to-br from-blue-500/10 to-blue-100/10 dark:from-blue-500/10 dark:to-blue-900/30 border-blue-500/20'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge className={`h-5 w-5 ${isCompleted ? 'text-green-500' : 'text-blue-500'}`} />
              Progress Meter
              {isCompleted && <Trophy className="h-5 w-5 text-yellow-500" />}
            </CardTitle>
            <CardDescription>
              {activeMeter.description || `Track your progress towards ${activeMeter.targetPercentage}%`}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Badge variant={isCompleted ? "default" : "outline"} className={isCompleted ? "bg-green-500" : ""}>
              {activeMeter.meterType}
            </Badge>
            {activeMeter.prizeUnlocked && (
              <Badge className="bg-yellow-500">
                Prize Unlocked!
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-bold">
              {activeMeter.currentPercentage}% / {activeMeter.targetPercentage}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {isCompleted && (
          <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold text-green-700 dark:text-green-300">
              Congratulations! 
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              You've reached your target and unlocked the prize!
            </p>
          </div>
        )}

        {activeMeter.completedAt && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Completed on {format(new Date(activeMeter.completedAt), "PPP")}
          </div>
        )}

        {meterHistory && meterHistory.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <History className="h-4 w-4 mr-2" />
                View Progress History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Progress History</DialogTitle>
                <DialogDescription>
                  Your meter progress changes over time
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {meterHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {entry.changeAmount > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">
                          {entry.oldPercentage}% → {entry.newPercentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {entry.changeReason || "Progress update"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {format(new Date(entry.changedAt), "MMM d, HH:mm")}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
      
      {!isCompleted && (
        <div className="absolute -bottom-4 -right-4 opacity-10">
          <Gauge className="h-20 w-20 text-blue-500" />
        </div>
      )}
    </Card>
  );
}
