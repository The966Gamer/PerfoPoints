
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { User } from "@/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MoreHorizontal, Search, CheckCircle2, XCircle, ShieldAlert, ShieldCheck, User as UserIcon, Users, Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UsersPage = () => {
  const { currentUser, getAllUsers, users, blockUser, updateProfile } = useAuth();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [userRole, setUserRole] = useState<string>("user");
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        await getAllUsers();
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };
    
    loadUsers();
  }, [getAllUsers]);
  
  useEffect(() => {
    const filtered = users.filter(user => 
      (activeTab === "all" || 
       (activeTab === "admins" && user.role === "admin") || 
       (activeTab === "users" && user.role === "user")) &&
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (showBlocked || !user.isBlocked)
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm, showBlocked, activeTab]);
  
  const handleUpdateRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      await updateProfile({
        id: userId,
        role: role
      });
      
      toast.success(`User role updated to ${role}`);
    } catch (error: any) {
      toast.error(`Failed to update role: ${error.message}`);
    }
  };
  
  const handleOpenUserDetails = (user: User) => {
    setSelectedUser(user);
    setUserPoints(user.points || 0);
    setUserRole(user.role || 'user');
    setIsDetailModalOpen(true);
  };
  
  const handleSaveUserChanges = async () => {
    if (!selectedUser) return;
    
    try {
      await updateProfile({
        id: selectedUser.id,
        points: userPoints,
        role: userRole as 'admin' | 'user'
      });
      
      toast.success("User details updated successfully!");
      setIsDetailModalOpen(false);
      getAllUsers();
    } catch (error: any) {
      toast.error(`Failed to update user: ${error.message}`);
    }
  };
  
  if (!currentUser || currentUser.role !== "admin") {
    return <PageLayout requireAuth>You don't have permission to view this page</PageLayout>;
  }
  
  return (
    <PageLayout requireAuth title="User Management">
      <Card className="bg-card/95 backdrop-blur-sm border-opacity-50">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm">
                <Award className="h-4 w-4 mr-2" />
                Award Points
              </Button>
              <Button variant="default" size="sm">
                <UserIcon className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="showBlocked" 
                  checked={showBlocked}
                  onCheckedChange={(checked) => setShowBlocked(checked === true)}
                />
                <label 
                  htmlFor="showBlocked"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Show blocked users
                </label>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="flex gap-2 items-center">
                <Users className="h-4 w-4" />
                All Users
                <Badge variant="outline" className="ml-1">{users.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="admins" className="flex gap-2 items-center">
                <ShieldAlert className="h-4 w-4" />
                Administrators
                <Badge variant="outline" className="ml-1">
                  {users.filter(u => u.role === "admin").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex gap-2 items-center">
                <UserIcon className="h-4 w-4" />
                Standard Users
                <Badge variant="outline" className="ml-1">
                  {users.filter(u => u.role === "user").length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <UsersTable 
              users={filteredUsers} 
              currentUser={currentUser} 
              onBlockUser={blockUser}
              onUpdateRole={handleUpdateRole}
              onViewDetails={handleOpenUserDetails}
            />
          </Tabs>
        </CardContent>
      </Card>
      
      {/* User Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and edit detailed information about this user.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser.avatarUrl} />
                  <AvatarFallback>
                    {selectedUser.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{selectedUser.username}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userPoints">Points</Label>
                  <Input 
                    id="userPoints" 
                    type="number" 
                    value={userPoints} 
                    onChange={(e) => setUserPoints(parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userRole">User Role</Label>
                  <Select value={userRole} onValueChange={setUserRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="user">Standard User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>User ID:</span>
                    <span className="font-mono text-muted-foreground">{selectedUser.id.substring(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Account Created:</span>
                    <span className="text-muted-foreground">
                      {selectedUser.createdAt ? format(new Date(selectedUser.createdAt), "PP") : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Email Verified:</span>
                    <span>
                      {selectedUser.emailVerified ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          Not Verified
                        </Badge>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUserChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

// UsersTable component
interface UsersTableProps {
  users: User[];
  currentUser: User;
  onBlockUser: (userId: string, isBlocked: boolean) => Promise<void>;
  onUpdateRole: (userId: string, role: 'admin' | 'user') => Promise<void>;
  onViewDetails: (user: User) => void;
}

const UsersTable = ({ users, currentUser, onBlockUser, onUpdateRole, onViewDetails }: UsersTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewDetails(user)}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.isBlocked ? (
                    <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                      <XCircle className="h-3 w-3" /> Blocked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.role === "admin" ? (
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <ShieldAlert className="h-3 w-3" /> Admin
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <UserIcon className="h-3 w-3" /> User
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{user.points}</TableCell>
                <TableCell>
                  {user.createdAt ? (
                    format(new Date(user.createdAt), "PP")
                  ) : (
                    "Unknown"
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {user.id !== currentUser.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.role !== "admin" ? (
                          <DropdownMenuItem
                            onClick={() => onUpdateRole(user.id, "admin")}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => onUpdateRole(user.id, "user")}
                          >
                            <UserIcon className="mr-2 h-4 w-4" />
                            Make User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => onBlockUser(user.id, !user.isBlocked)}
                        >
                          {user.isBlocked ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Unblock User
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Block User
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewDetails(user)}>
                          <Award className="mr-2 h-4 w-4" />
                          Manage Points
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersPage;
