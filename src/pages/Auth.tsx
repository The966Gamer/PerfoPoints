
import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLayout } from "@/components/layout/PageLayout";
import { ArrowLeft, Check, Eye, EyeOff, Mail, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  const { signIn, signUp, currentUser, resetPassword } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // Schema for signup form validation
  const signupSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    fullName: z.string().optional(),
    email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
    password: z.string().min(6, { message: "Password must be at least 6 characters" })
  });

  // Schema for login form validation
  const loginSchema = z.object({
    emailOrUsername: z.string().min(1, { message: "Email or username is required" }),
    password: z.string().min(1, { message: "Password is required" })
  });

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: ""
    }
  });

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: "",
      password: ""
    }
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      // First check if input is an email or username
      const isEmail = values.emailOrUsername.includes('@');
      
      if (isEmail) {
        // Direct login with email
        await signIn(values.emailOrUsername, values.password);
      } else {
        // Look up user by username
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', values.emailOrUsername)
          .single();
          
        if (error || !data?.email) {
          toast.error("Username not found");
          setLoading(false);
          return;
        }
        
        // Login with the found email
        await signIn(data.email, values.password);
      }
      
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
    setLoading(true);
    try {
      // Generate anonymous email if not provided
      const finalEmail = values.email || `${values.username}${Math.floor(Math.random() * 100000)}@perfopointsapp.com`;
      
      await signUp(finalEmail, values.password, values.username, values.fullName || values.username);
      
      // Show verification sent message if real email
      if (values.email) {
        setVerificationSent(true);
      } else {
        toast.success("Account created! You can now sign in");
        setActiveTab("login");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordEmail) {
      toast.error("Please enter your email address");
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(resetPasswordEmail);
      toast.success("Password reset link sent to your email");
      setShowResetForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      toast.success("Verification email sent successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md shadow-lg border-opacity-50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Perfo Points</CardTitle>
            <CardDescription className="text-center">
              Premium Family Rewards System
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verificationSent ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Verification Email Sent!</AlertTitle>
                  <AlertDescription>
                    Please check your inbox and click the link to verify your email.
                  </AlertDescription>
                </Alert>
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">Didn't get the email?</p>
                  <Button 
                    variant="link" 
                    onClick={handleSendVerification}
                    disabled={loading}
                  >
                    Send again
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setVerificationSent(false);
                    setActiveTab("login");
                  }}
                >
                  Back to Login
                </Button>
              </div>
            ) : showResetForm ? (
              <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={resetPasswordEmail}
                    onChange={(e) => setResetPasswordEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setShowResetForm(false)}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 mt-4">
                      <FormField
                        control={loginForm.control}
                        name="emailOrUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email or Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your email or username"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  {...field}
                                />
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="sm" 
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="text-right">
                        <Button 
                          type="button" 
                          variant="link" 
                          className="px-0 text-sm h-auto"
                          onClick={() => setShowResetForm(true)}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4 mt-4">
                      <FormField
                        control={signupForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Choose a username" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your full name" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="Enter your email" 
                                {...field} 
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              Email is optional, but required for password recovery
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Choose a password"
                                  {...field}
                                />
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="sm" 
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating Account..." : "Sign Up"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center text-muted-foreground">
              <p>Secure, Premium Family Rewards System</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Auth;
