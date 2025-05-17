
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const ProfilePage = () => {
  const { currentUser, updateProfile, updateAvatar, sendVerificationEmail, changeEmail, changePassword } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerificationEmailSending, setIsVerificationEmailSending] = useState(false);
  
  if (!currentUser) {
    return <PageLayout requireAuth>Loading profile...</PageLayout>;
  }
  
  // Profile update schema
  const profileSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    fullName: z.string().optional()
  });
  
  // Email update schema
  const emailSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" })
  });
  
  // Password update schema
  const passwordSchema = z.object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" })
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });
  
  // Create form hooks
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: currentUser.username || "",
      fullName: ""
    }
  });
  
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: currentUser.email || ""
    }
  });
  
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const handleUpdateProfile = async (values: z.infer<typeof profileSchema>) => {
    try {
      await updateProfile({ username: values.username });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
    }
  };

  const handleChangeEmail = async (values: z.infer<typeof emailSchema>) => {
    try {
      await changeEmail(values.email);
    } catch (error: any) {
      toast.error(error.message || "Error updating email");
    }
  };

  const handleChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    try {
      await changePassword(values.currentPassword, values.newPassword);
      passwordForm.reset();
    } catch (error: any) {
      // Error is handled in the changePassword function
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!currentUser.email) {
      toast.error("No email address associated with this account");
      return;
    }
    
    try {
      setIsVerificationEmailSending(true);
      await sendVerificationEmail(currentUser.email);
    } catch (error: any) {
      // Error is handled in the sendVerificationEmail function
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
                  <span>{currentUser.email || "No email set"}</span>
                  {currentUser.email && (
                    currentUser.emailVerified ? (
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
                    )
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
            <TabsTrigger value="email" className="flex-1">Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="flex-1 pt-2">
            <Card className="shadow-md bg-card/95 backdrop-blur-sm border-opacity-50 h-full">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your full name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Save Changes</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="flex-1 pt-2">
            <Card className="shadow-md bg-card/95 backdrop-blur-sm border-opacity-50 h-full">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field}
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Enter current password" 
                              />
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm" 
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field}
                                type={showNewPassword ? "text" : "password"}
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field}
                                type={showConfirmPassword ? "text" : "password"}
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Update Password</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="email" className="flex-1 pt-2">
            <Card className="shadow-md bg-card/95 backdrop-blur-sm border-opacity-50 h-full">
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>Update your email address</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleChangeEmail)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              type="email"
                              placeholder="Enter your email address" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-sm text-muted-foreground">
                      Note: Changing your email will require verification of the new address.
                    </p>
                    {currentUser.email && !currentUser.emailVerified && (
                      <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-2 rounded">
                        <p>Your current email is not verified.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleSendVerificationEmail}
                          disabled={isVerificationEmailSending}
                        >
                          {isVerificationEmailSending ? "Sending..." : "Send verification email"}
                        </Button>
                      </div>
                    )}
                    <Button type="submit" className="w-full">Update Email</Button>
                  </form>
                </Form>
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
