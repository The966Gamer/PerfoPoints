
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Loader2 } from "lucide-react";

const Login = () => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isRegistering) {
        // Fix: Pass metadata as an object (Record<string, any>)
        const metadata = { username };
        await register(email, password, metadata);
      } else {
        await login(email, password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="auth-card">
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
            <Input
              type="password"
              id="password"
              className="auth-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
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
              onClick={() => setIsRegistering(!isRegistering)}
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
