
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const { getUserTransactions } = useData();
  
  if (!currentUser) return null;
  
  const userTransactions = getUserTransactions(currentUser.id);
  
  // Calculate stats
  const earnedPoints = userTransactions
    .filter(t => t.type === "earned")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const spentPoints = Math.abs(
    userTransactions
      .filter(t => t.type === "spent")
      .reduce((sum, t) => sum + t.amount, 0)
  );
  
  return (
    <PageLayout requireAuth title="My Profile">
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                  {currentUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{currentUser.username}</h2>
                <p className="text-muted-foreground capitalize">
                  {currentUser.role}
                </p>
                <p className="text-sm">
                  Member since {format(new Date(currentUser.createdAt), "MMMM d, yyyy")}
                </p>
                
                {currentUser.role === "user" && (
                  <div className="pt-2">
                    <div className="inline-block bg-accent px-3 py-1 rounded-full">
                      <span className="font-bold text-lg">{currentUser.points}</span>
                      <span className="text-sm text-muted-foreground ml-1">points</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-grow" />
              
              <Button
                variant="outline"
                onClick={() => logout()}
                className="md:self-start"
              >
                Log out
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {currentUser.role === "user" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Points Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{earnedPoints}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Points Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-secondary">{spentPoints}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{currentUser.points}</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {currentUser.role === "user" && (
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your point earning and spending history</CardDescription>
            </CardHeader>
            <CardContent>
              {userTransactions.length > 0 ? (
                <div className="space-y-4">
                  {userTransactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex justify-between items-center border-b pb-3"
                    >
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.createdAt), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                      <div className={`font-bold ${transaction.type === 'earned' ? 'text-success' : 'text-destructive'}`}>
                        {transaction.type === 'earned' ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No transactions yet
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
