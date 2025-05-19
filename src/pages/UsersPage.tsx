
import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Gift, UserX, UserCheck, Shield, BadgeCheck } from 'lucide-react';
import { AdminGiftDialog } from '@/components/admin/AdminGiftDialog';

const UsersPage = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map to User type
      const mappedUsers: User[] = data.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email || '',
        avatarUrl: user.avatar_url || '',
        points: user.points,
        role: user.role as 'admin' | 'user',
        emailVerified: user.email_verified,
        isBlocked: user.is_blocked || false,
      }));
      
      setUsers(mappedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserBlock = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !user.isBlocked })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(`User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully!`);
      fetchUsers();
    } catch (error: any) {
      console.error('Error toggling user block:', error);
      toast.error(error.message);
    }
  };

  const toggleAdminRole = async (user: User) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(`User role changed to ${newRole} successfully!`);
      fetchUsers();
    } catch (error: any) {
      console.error('Error changing user role:', error);
      toast.error(error.message);
    }
  };

  const openGiftDialog = (user: User) => {
    setSelectedUser(user);
    setIsGiftDialogOpen(true);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <PageLayout requireAuth title="Unauthorized">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to view this page.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout requireAuth title="User Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Users</h2>
          <Button onClick={fetchUsers} variant="outline" disabled={loading}>
            Refresh List
          </Button>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableCaption>Manage all users in the system</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Name & Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <div>{user.fullName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? "default" : "outline"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{user.points}</TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <Badge variant="destructive">Blocked</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openGiftDialog(user)}
                    >
                      <Gift className="h-4 w-4 mr-1" />
                      Gift
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdminRole(user)}
                    >
                      <BadgeCheck className="h-4 w-4 mr-1" />
                      {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                    <Button 
                      variant={user.isBlocked ? "default" : "destructive"}
                      size="sm"
                      onClick={() => toggleUserBlock(user)}
                    >
                      {user.isBlocked ? (
                        <UserCheck className="h-4 w-4 mr-1" />
                      ) : (
                        <UserX className="h-4 w-4 mr-1" />
                      )}
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <AdminGiftDialog 
        open={isGiftDialogOpen} 
        onClose={() => setIsGiftDialogOpen(false)} 
        user={selectedUser} 
      />
    </PageLayout>
  );
};

export default UsersPage;
