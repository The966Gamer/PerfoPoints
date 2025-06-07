
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Users, UserPlus, Crown, Trophy, Target, TrendingUp, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function FamilyTracking() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  
  // Mock family data
  const familyMembers = [
    {
      id: "1",
      name: "Ahmed (Dad)",
      role: "admin",
      points: 450,
      tasksCompleted: 28,
      streak: 12,
      avatar: "",
      status: "active"
    },
    {
      id: "2", 
      name: "Fatima (Mom)",
      role: "admin",
      points: 380,
      tasksCompleted: 24,
      streak: 8,
      avatar: "",
      status: "active"
    },
    {
      id: "3",
      name: "Omar",
      role: "user",
      points: 220,
      tasksCompleted: 15,
      streak: 5,
      avatar: "",
      status: "active"
    },
    {
      id: "4",
      name: "Aisha",
      role: "user", 
      points: 180,
      tasksCompleted: 12,
      streak: 3,
      avatar: "",
      status: "active"
    }
  ];
  
  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }
    
    setIsInviting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Family invitation sent!", {
        description: `An invitation has been sent to ${inviteEmail}`
      });
      setInviteEmail("");
      setIsInviting(false);
    }, 1500);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Family Tracking</h3>
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
          Premium
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Family Members</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Family Member</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="family@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteEmail("")}>
                      Cancel
                    </Button>
                    <Button onClick={handleInvite} disabled={isInviting}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>
              Manage and track progress of all family members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.split(' ')[0].slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{member.name}</h4>
                        {member.role === 'admin' && <Crown className="h-3 w-3 text-yellow-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {member.points} points • {member.tasksCompleted} tasks • {member.streak} day streak
                      </p>
                    </div>
                  </div>
                  <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Family Leaderboard
            </CardTitle>
            <CardDescription>
              See who's leading this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {familyMembers
                .sort((a, b) => b.points - a.points)
                .map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{member.name.split(' ')[0]}</h4>
                        <p className="text-xs text-muted-foreground">{member.points} points</p>
                      </div>
                    </div>
                    {index < 3 && (
                      <Trophy className={`h-4 w-4 ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        'text-amber-600'
                      }`} />
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Family Goals
          </CardTitle>
          <CardDescription>
            Track collective family progress and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Weekly Family Points Goal</h4>
                <span className="text-sm text-muted-foreground">1,230 / 1,500</span>
              </div>
              <Progress value={82} className="h-2" />
              <p className="text-xs text-muted-foreground">82% complete - 270 points to go!</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Daily Prayer Streak</h4>
                <span className="text-sm text-muted-foreground">15 / 30 days</span>
              </div>
              <Progress value={50} className="h-2" />
              <p className="text-xs text-muted-foreground">Keep going! Halfway to the monthly goal</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Tasks Completed This Week</h4>
                <span className="text-sm text-muted-foreground">79 / 100</span>
              </div>
              <Progress value={79} className="h-2" />
              <p className="text-xs text-muted-foreground">21 more tasks to reach the weekly target</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Detailed Analytics
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
