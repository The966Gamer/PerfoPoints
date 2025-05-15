
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import RequestList from "./RequestList";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { users } = useAuth();
  const { tasks, rewards, requests } = useData();
  
  const pendingRequests = requests.filter(req => req.status === "pending");
  const activeUsers = users.filter(user => user.role === "user" && !user.isBlocked);
  
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{activeUsers.length}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={() => navigate("/users")}>
              Manage Users
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{tasks.length}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={() => navigate("/tasks")}>
              Manage Tasks
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{rewards.length}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={() => navigate("/rewards")}>
              Manage Rewards
            </Button>
          </CardFooter>
        </Card>
        
        <Card className={pendingRequests.length > 0 ? "border-secondary" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${pendingRequests.length > 0 ? "text-secondary" : ""}`}>
              {pendingRequests.length}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant={pendingRequests.length > 0 ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => navigate("/requests")}
            >
              Review Requests
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Recent Activity Section */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recent Point Requests</CardTitle>
          <CardDescription>Approve or deny point requests from users</CardDescription>
        </CardHeader>
        <CardContent>
          <RequestList limit={5} />
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => navigate("/requests")}>
            View All Requests
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
