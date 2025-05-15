
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Leaderboard = () => {
  const { users } = useAuth();
  
  // Filter out admin users and sort by points (highest to lowest)
  const sortedUsers = users
    .filter(user => user.role === "user" && !user.isBlocked)
    .sort((a, b) => b.points - a.points);
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedUsers.length > 0 ? (
          <div className="space-y-4">
            {sortedUsers.map((user, index) => (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? "bg-yellow-50" : 
                  index === 1 ? "bg-gray-50" : 
                  index === 2 ? "bg-amber-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{user.points}</span>
                  <span className="text-sm text-muted-foreground">points</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="font-medium text-lg">No users yet</h3>
            <p className="text-muted-foreground">
              The leaderboard will show once there are active users
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
