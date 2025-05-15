
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Lock, User } from "lucide-react";

const UsersPage = () => {
  const { users, addUser, updateUser } = useAuth();
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Filter out admin users for display
  const nonAdminUsers = users.filter(user => user.role === "user");
  
  const resetForm = () => {
    setUsername("");
    setPassword("");
  };
  
  const handleAddUser = async () => {
    if (!username || !password) return;
    
    await addUser(username, password);
    resetForm();
    setIsAddingUser(false);
  };
  
  const toggleUserBlock = async (user) => {
    await updateUser({ ...user, isBlocked: !user.isBlocked });
  };
  
  return (
    <PageLayout requireAuth requireAdmin title="Manage Users">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nonAdminUsers.map((user) => (
            <Card key={user.id} className={user.isBlocked ? "border-destructive" : ""}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{user.username}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.points} points
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                      <Switch
                        checked={!user.isBlocked}
                        onCheckedChange={() => toggleUserBlock(user)}
                      />
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Lock className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {nonAdminUsers.length === 0 && (
            <div className="col-span-full text-center py-16">
              <h3 className="text-lg font-medium mb-2">No users available</h3>
              <p className="text-muted-foreground">
                Click the 'Add User' button to create your first user
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default UsersPage;
