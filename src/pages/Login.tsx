
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Loader2, Eye, EyeClosed, Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const Login = () => {
  const { signIn, signUp, sendVerificationEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerificationNeeded, setEmailVerificationNeeded] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isRegistering) {
        await signUp(email, password, username);
        setEmailVerificationNeeded(true);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      // Special handling for email verification errors
      if (error.message && error.message.includes("Email not verified")) {
        setEmailVerificationNeeded(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await sendVerificationEmail(email);
      toast.success("Verification email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error sending verification email:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="auth-card shadow-lg border-opacity-50 backdrop-blur-sm">
        <CardHeader className="auth-header">
          <CardTitle className="text-2xl font-bold text-center">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isRegistering 
              ? "Register to start managing tasks and earning rewards"
              : "Sign in to your account to continue"
            }
          </CardDescription>
        </CardHeader>
        
        {emailVerificationNeeded && (
          <Alert className="mx-4 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification required</AlertTitle>
            <AlertDescription>
              Please verify your email address to continue.
              <Button 
                variant="link" 
                onClick={handleResendVerification}
                className="p-0 h-auto"
                disabled={isSubmitting}
              >
                Resend verification email
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {isRegistering && (
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium"
              >
                Username
              </label>
              <Input
                type="text"
                id="username"
                className="auth-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium"
            >
              Email
            </label>
            <Input
              type="email"
              id="email"
              className="auth-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium"
            >
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                className="auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>
          
          <div className="pt-2">
            <Button
              className="auth-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRegistering ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                isRegistering ? "Register" : "Login"
              )}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setEmailVerificationNeeded(false);
              }}
              disabled={isSubmitting}
            >
              {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
