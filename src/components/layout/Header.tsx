
import React from "react";
import { ImprovedMenu } from "@/components/ui/improved-menu";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { showNotification } from "@/utils/notifications";

export function Header() {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { currentUser } = useAuth();
  
  const handleDeleteAllUsers = async () => {
    try {
      // Only admins should be able to perform this action
      if (currentUser?.role !== 'admin') {
        showNotification('Only admins can delete users', 'error');
        return;
      }
      
      // First, delete profiles which will cascade to auth.users
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .neq('id', currentUser.id); // Keep current admin user
      
      if (profilesError) throw profilesError;
      
      showNotification('All users have been deleted successfully', 'success');
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error('Error deleting users:', error);
      showNotification(`Error deleting users: ${error.message}`, 'error');
    }
  };
  
  return (
    <>
      <div className="flex w-full items-center">
        <ImprovedMenu />
        
        {currentUser?.role === 'admin' && (
          <Button 
            variant="destructive" 
            size="sm"
            className="ml-auto mr-4"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete All Users
          </Button>
        )}
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Users</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete ALL users except yourself. This action cannot be undone.
              Are you absolutely sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAllUsers}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete All Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
