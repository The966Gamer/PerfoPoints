
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
        
        toast({
          title: "Authentication successful",
          description: "You're now logged in.",
        });
        
        navigate("/dashboard");
      } catch (error) {
        console.error("Auth callback error:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to complete authentication. Please try again.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    
    handleAuthCallback();
  }, [navigate]);
  
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
