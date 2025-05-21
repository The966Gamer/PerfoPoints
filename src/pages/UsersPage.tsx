
import { useEffect, useState } from 'react';
import { useUsers } from '@/hooks/data/useUsers';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, UserCheck, UserX } from 'lucide-react';
import { AdminGiftDialog } from '@/components/admin/AdminGiftDialog';
import { toast } from 'sonner';

export default function UsersPage() {
  const { users, loading, fetchUsers, updateUserProfile } = useUsers();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users && users.length > 0) {
      const filtered = searchTerm
        ? users.filter(user => 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())))
        : users;
      
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const toggleUserBlock = async (user: User) => {
    try {
      const success = await updateUserProfile(user.id, {
        isBlocked: !user.isBlocked
      });
      
      if (success) {
        toast.success(`User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`);
        fetchUsers();
      }
    } catch (error) {
      console.error("Error toggling user block status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleOpenGiftDialog = (user: User) => {
    setSelectedUser(user);
    setGiftDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  return (
    <div className="container p-4">
      <Heading level={1}>Manage Users</Heading>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full rounded-md border border-gray-300 p-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-4">
        {filteredUsers.map(user => (
          <div 
            key={user.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.username}</div>
                <div className="text-sm text-gray-500">{user.fullName}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={user.role === 'admin' ? "destructive" : "outline"}>
                    {user.role}
                  </Badge>
                  <Badge variant="secondary">
                    {user.points} points
                  </Badge>
                  {user.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleOpenGiftDialog(user)}
              >
                <PlusCircle className="mr-1 h-4 w-4" />
                Gift
              </Button>
              
              <Button 
                variant={user.isBlocked ? "default" : "destructive"} 
                size="sm"
                onClick={() => toggleUserBlock(user)}
              >
                {user.isBlocked ? (
                  <>
                    <UserCheck className="mr-1 h-4 w-4" />
                    Unblock
                  </>
                ) : (
                  <>
                    <UserX className="mr-1 h-4 w-4" />
                    Block
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
        
        {filteredUsers.length === 0 && (
          <div className="rounded-md bg-gray-50 p-8 text-center">
            No users found.
          </div>
        )}
      </div>
      
      {selectedUser && (
        <AdminGiftDialog
          open={giftDialogOpen}
          onClose={() => setGiftDialogOpen(false)}
          user={selectedUser}
          onSuccess={() => {
            fetchUsers();
            setGiftDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
