
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Lock, 
  Unlock, 
  Shield, 
  ShieldOff, 
  Trophy,
  Star,
  UserCheck,
  Mail
} from "lucide-react";
import { User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UsersPage = () => {
  const { users, blockUser, updateUserRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [pointsToAward, setPointsToAward] = useState(0);

  const handleBlockUser = async (user: User) => {
    try {
      setProcessing(user.id);
      await blockUser(user.id, !user.isBlocked);
    } finally {
      setProcessing(null);
    }
  };

  const handleRoleToggle = async (user: User) => {
    try {
      setProcessing(user.id);
      await updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin');
    } finally {
      setProcessing(null);
    }
  };

  const awardPoints = async () => {
    if (!selectedUser || pointsToAward <= 0) return;
    
    try {
      setProcessing(selectedUser.id);
      // Implementation would go here
      // Add the points logic later
      
      setShowAwardDialog(false);
      setPointsToAward(0);
      setSelectedUser(null);
    } finally {
      setProcessing(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <PageLayout requireAuth requireAdmin title="User Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage users and assign roles</p>
          </div>
          <div className="w-full sm:w-64">
            <Input 
              placeholder="Search users..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="users">Regular Users</TabsTrigger>
            <TabsTrigger value="blocked">Blocked</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <UserTable 
              users={filteredUsers} 
              processing={processing}
              handleBlockUser={handleBlockUser}
              handleRoleToggle={handleRoleToggle}
              setSelectedUser={setSelectedUser}
              setShowAwardDialog={setShowAwardDialog}
            />
          </TabsContent>
          
          <TabsContent value="admins">
            <UserTable 
              users={filteredUsers.filter(user => user.role === 'admin')}
              processing={processing}
              handleBlockUser={handleBlockUser}
              handleRoleToggle={handleRoleToggle}
              setSelectedUser={setSelectedUser}
              setShowAwardDialog={setShowAwardDialog}
            />
          </TabsContent>
          
          <TabsContent value="users">
            <UserTable 
              users={filteredUsers.filter(user => user.role === 'user')} 
              processing={processing}
              handleBlockUser={handleBlockUser}
              handleRoleToggle={handleRoleToggle}
              setSelectedUser={setSelectedUser}
              setShowAwardDialog={setShowAwardDialog}
            />
          </TabsContent>
          
          <TabsContent value="blocked">
            <UserTable 
              users={filteredUsers.filter(user => user.isBlocked)}
              processing={processing}
              handleBlockUser={handleBlockUser}
              handleRoleToggle={handleRoleToggle}
              setSelectedUser={setSelectedUser}
              setShowAwardDialog={setShowAwardDialog}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Award Points Dialog */}
      <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Points to {selectedUser?.username}</DialogTitle>
            <DialogDescription>
              Enter the number of points you want to award to this user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              min="0"
              value={pointsToAward}
              onChange={(e) => setPointsToAward(parseInt(e.target.value) || 0)}
              placeholder="Enter points"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAwardDialog(false)}>Cancel</Button>
            <Button onClick={awardPoints}>Award Points</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

interface UserTableProps {
  users: User[];
  processing: string | null;
  handleBlockUser: (user: User) => Promise<void>;
  handleRoleToggle: (user: User) => Promise<void>;
  setSelectedUser: (user: User) => void;
  setShowAwardDialog: (show: boolean) => void;
}

const UserTable = ({ 
  users, 
  processing,
  handleBlockUser,
  handleRoleToggle,
  setSelectedUser,
  setShowAwardDialog
}: UserTableProps) => {
  return (
    <Card className="p-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.username || "No username"}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "secondary" : "outline"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.points}</TableCell>
                <TableCell>
                  {(user.emailVerified || user.email_verified) ? (
                    <Badge variant="success" className="bg-success/20 text-success border-success/30">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {(user.createdAt || user.created_at)
                    ? format(new Date(user.createdAt || user.created_at || ''), "MMM d, yyyy")
                    : "Unknown"}
                </TableCell>
                <TableCell>
                  {user.isBlocked ? (
                    <Badge variant="destructive">Blocked</Badge>
                  ) : (
                    <Badge variant="outline" className="text-success bg-success/10">
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={processing === user.id}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleBlockUser(user)}
                        className={user.isBlocked ? "text-success" : "text-destructive"}
                      >
                        {user.isBlocked ? (
                          <>
                            <Unlock className="mr-2 h-4 w-4" />
                            <span>Unblock User</span>
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            <span>Block User</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleToggle(user)}>
                        {user.role === 'admin' ? (
                          <>
                            <ShieldOff className="mr-2 h-4 w-4" />
                            <span>Remove Admin</span>
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Make Admin</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedUser(user);
                          setShowAwardDialog(true);
                        }}
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Award Points</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default UsersPage;
