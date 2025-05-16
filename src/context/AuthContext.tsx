
import { User, Session } from "@supabase/supabase-js";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Extend the User type with additional profile information
export interface ExtendedUser extends Omit<User, "created_at"> {
  username?: string;
  role: "admin" | "user";
  points: number;
  email_verified: boolean;
  created_at?: string; // Make it optional to match the override
  isBlocked?: boolean; // Add isBlocked property for user management
  avatar_url?: string; // Add avatar URL for profile images
}

// Context type definition
interface AuthContextType {
  currentUser: ExtendedUser | null;
  users: ExtendedUser[];
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, metadata: Record<string, any>) => Promise<void>;
  updateProfile: (data: Partial<ExtendedUser>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (userId: string, data: Partial<ExtendedUser>) => Promise<void>;
  blockUser: (userId: string, isBlocked: boolean) => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  users: [],
  session: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  updateProfile: async () => {},
  resetPassword: async () => {},
  updateUser: async () => {},
  blockUser: async () => {},
});

// Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch current session and user profile on initial load
  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          
          if (error) throw error;

          // Merge auth user data with profile data
          const extendedUser: ExtendedUser = {
            ...session.user,
            username: profile.username || "",
            role: profile.role as "admin" | "user",
            points: profile.points || 0,
            email_verified: profile.email_verified,
            isBlocked: profile.is_blocked || false,
            avatar_url: profile.avatar_url
          };
          
          setCurrentUser(extendedUser);
        }
      } catch (error) {
        console.error("Error loading user session:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (session?.user) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            return;
          }

          // Merge auth user data with profile data
          const extendedUser: ExtendedUser = {
            ...session.user,
            username: profile.username || "",
            role: profile.role as "admin" | "user",
            points: profile.points || 0,
            email_verified: profile.email_verified,
            isBlocked: profile.is_blocked || false,
            avatar_url: profile.avatar_url
          };
          
          setCurrentUser(extendedUser);
        } else {
          setCurrentUser(null);
        }
      }
    );

    // Fetch all users if current user is admin
    const fetchUsers = async () => {
      if (currentUser?.role === "admin") {
        const { data, error } = await supabase.from("profiles").select("*");
        
        if (error) {
          console.error("Error fetching users:", error);
          return;
        }
        
        setUsers(data as ExtendedUser[]);
      }
    };

    if (currentUser?.role === "admin") {
      fetchUsers();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser?.role]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, metadata: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<ExtendedUser>) => {
    try {
      if (!currentUser) throw new Error("No user is logged in");

      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", currentUser.id);

      if (error) throw error;

      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for the reset link",
      });
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Admin function to update user data
  const updateUser = async (userId: string, data: Partial<ExtendedUser>) => {
    try {
      if (currentUser?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", userId);

      if (error) throw error;

      // Update users list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, ...data } : user
        )
      );
      
      toast({
        title: "User updated",
        description: "User has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Admin function to block/unblock user
  const blockUser = async (userId: string, isBlocked: boolean) => {
    try {
      if (currentUser?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: isBlocked })
        .eq("id", userId);

      if (error) throw error;

      // Update users list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isBlocked } : user
        )
      );
      
      toast({
        title: `User ${isBlocked ? 'blocked' : 'unblocked'}`,
        description: `User has been ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    users,
    session,
    loading,
    login,
    logout,
    register,
    updateProfile,
    resetPassword,
    updateUser,
    blockUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
