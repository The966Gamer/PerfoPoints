import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLayout } from "@/components/layout/PageLayout";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [resetComplete, setResetComplete] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (!accessToken || type !== 'recovery') {
          setIsValidToken(false);
          setIsCheckingToken(false);
          return;
        }

        // Validate the tokens by attempting to set the session temporarily
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (error || !data.session) {
          console.error('Invalid reset token:', error);
          setIsValidToken(false);
        } else {
          // Tokens are valid, but sign out immediately to prevent auto-login
          await supabase.auth.signOut();
          setIsValidToken(true);
        }
      } catch (error) {
        console.error('Error checking reset token:', error);
        setIsValidToken(false);
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [searchParams]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      // Set the session with the recovery tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken!,
        refresh_token: refreshToken || '',
      });

      if (sessionError) {
        throw sessionError;
      }

      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setResetComplete(true);
      toast.success("Password reset successfully!");
      
      // Sign out and redirect to login after a delay
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/auth");
      }, 3000);

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Verifying reset link...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (!isValidToken) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center">
                <XCircle className="mr-2 h-6 w-6 text-destructive" />
                Invalid Reset Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Reset Link Invalid</AlertTitle>
                <AlertDescription>
                  This password reset link is invalid or has expired. Please request a new password reset.
                </AlertDescription>
              </Alert>
              <Button 
                className="w-full mt-4" 
                onClick={() => navigate("/auth")}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (resetComplete) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center">
                <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                Password Reset Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Your password has been successfully reset. You will be redirected to the login page shortly.
                </AlertDescription>
              </Alert>
              <Button 
                className="w-full mt-4" 
                onClick={() => navigate("/auth")}
              >
                Go to Login Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md shadow-lg border-opacity-50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || password !== confirmPassword || password.length < 6}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                onClick={() => navigate("/auth")}
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ResetPassword;
