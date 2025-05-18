
import { useData } from "@/context/DataContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { RequestList } from "./RequestList";
import { UserPlus, Award, CheckCircle, Calendar, TrendingUp, Users, FileText, ShieldAlert } from "lucide-react";
import { PremiumAdminTools } from "./PremiumAdminTools";

export function AdminDashboard() {
  const { pointRequests, tasks, rewards, requests } = useData();
  
  // Calculate statistics
  const pendingRequests = requests.filter(req => req.status === "pending").length;
  const completedRequests = requests.filter(req => req.status === "approved").length;
  const totalTasks = tasks.length;
  const totalRewards = rewards.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
              <CardDescription>
                Awaiting review
              </CardDescription>
            </div>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Completed Tasks
              </CardTitle>
              <CardDescription>
                Total approved
              </CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Active Tasks
              </CardTitle>
              <CardDescription>
                Available to users
              </CardDescription>
            </div>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Available Rewards
              </CardTitle>
              <CardDescription>
                For redemption
              </CardDescription>
            </div>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRewards}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="requests">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" /> Requests
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center">
            <ShieldAlert className="h-4 w-4 mr-2" /> Premium Tools
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" /> User Management
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="space-y-4 mt-6">
          <RequestList />
        </TabsContent>
        
        <TabsContent value="premium" className="space-y-4 mt-6">
          <PremiumAdminTools />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage your users here or visit the full user management page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">User Management</h3>
                <p className="text-muted-foreground mb-4">
                  Access the full user management page to view and edit all user accounts.
                </p>
                <a href="/users" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Go to User Management
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
