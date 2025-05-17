
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
import { MoreHorizontal, Search, CheckCircle2, XCircle, ShieldAlert, ShieldCheck, User as UserIcon } from "lucide-react";

const UsersPage = () => {
  const { currentUser, getAllUsers, users, blockUser, updateProfile } = useAuth();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
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
  
  if (!currentUser || currentUser.role !== "admin") {
    return <PageLayout requireAuth>You don't have permission to view this page</PageLayout>;
  }
  
  return (
    <PageLayout requireAuth title="User Management">
      <Card className="bg-card/95 backdrop-blur-sm border-opacity-50">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage user accounts</CardDescription>
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
                  onCheckedChange={(checked) => setShowBlocked(checked as boolean)}
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
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="admins">Administrators</TabsTrigger>
              <TabsTrigger value="users">Standard Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <UsersTable 
                users={filteredUsers} 
                currentUser={currentUser} 
                onBlockUser={blockUser}
                onUpdateRole={handleUpdateRole}
              />
            </TabsContent>
            
            <TabsContent value="admins" className="space-y-4">
              <UsersTable 
                users={filteredUsers} 
                currentUser={currentUser} 
                onBlockUser={blockUser}
                onUpdateRole={handleUpdateRole}
              />
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <UsersTable 
                users={filteredUsers} 
                currentUser={currentUser} 
                onBlockUser={blockUser}
                onUpdateRole={handleUpdateRole}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

// UsersTable component
interface UsersTableProps {
  users: User[];
  currentUser: User;
  onBlockUser: (userId: string, isBlocked: boolean) => Promise<void>;
  onUpdateRole: (userId: string, role: 'admin' | 'user') => Promise<void>;
}

const UsersTable = ({ users, currentUser, onBlockUser, onUpdateRole }: UsersTableProps) => {
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
              <TableRow key={user.id}>
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
                <TableCell>
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
