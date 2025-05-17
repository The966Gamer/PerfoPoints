
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, User, Mail, Check, Eye, EyeClosed } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [username, setUsername] = useState(currentUser?.username || "");
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerificationEmailSending, setIsVerificationEmailSending] = useState(false);
  
  if (!currentUser) {
    return <PageLayout requireAuth>Loading profile...</PageLayout>;
  }
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ username });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Error updating password");
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      setIsVerificationEmailSending(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: currentUser.email
      });
      
      if (error) throw error;
      
      toast.success("Verification email sent successfully");
    } catch (error: any) {
      toast.error(error.message || "Error sending verification email");
    } finally {
      setIsVerificationEmailSending(false);
    }
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Create avatars bucket if it doesn't exist
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('avatars');
      if (bucketError && bucketError.message.includes('does not exist')) {
        await supabase.storage.createBucket('avatars', { public: true });
      }
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}.${fileExt}`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
        
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      
      // Update profile
      await updateProfile({ avatarUrl: urlData.publicUrl });
      
      toast.success("Avatar updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <PageLayout requireAuth title="My Profile">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md bg-card/95 backdrop-blur-sm border-opacity-50">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View and manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                  <AvatarImage src={currentUser.avatarUrl || ''} />
                  <AvatarFallback className="bg-primary text-4xl">
                    <User size={48} />
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground p-2 rounded-full cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                </label>
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium">{currentUser.username || "No username set"}</h3>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail size={14} />
                  <span>{currentUser.email}</span>
                  {currentUser.emailVerified ? (
                    <span className="inline-flex items-center text-green-500">
                      <Check size={14} className="mr-1" /> Verified
                    </span>
                  ) : (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto text-amber-500"
                      onClick={handleSendVerificationEmail}
                      disabled={isVerificationEmailSending}
                    >
                      {isVerificationEmailSending ? "Sending..." : "Verify now"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium capitalize">{currentUser.role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Points</span>
                <span className="font-medium">{currentUser.points}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-medium">
                  {currentUser.createdAt ? format(new Date(currentUser.createdAt), "PPP") : "Unknown"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="profile" className="flex flex-col h-full">
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
            <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="flex-1 pt-2">
            <Card className="shadow-md bg-card/95 backdrop-blur-sm border-opacity-50 h-full">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium">
                      Username
                    </label>
                    <Input 
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input 
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <Button type="submit" className="w-full">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="flex-1 pt-2">
            <Card className="shadow-md bg-card/95 backdrop-blur-sm border-opacity-50 h-full">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Update your password and security details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <h3 className="text-sm font-semibold">Change Password</h3>
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </label>
                    <div className="relative">
                      <Input 
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input 
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Update Password</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Card className="mt-6 shadow-md bg-card/95 backdrop-blur-sm border-opacity-50">
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>Your recent tasks and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Your activity history will appear here
          </p>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ProfilePage;
