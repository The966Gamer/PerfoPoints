
import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Extended User interface to include Supabase Auth properties
export interface ExtendedUser extends User {
  app_metadata: any;
  user_metadata: any;
  aud: string;
  email?: string;
  emailVerified?: boolean;
}

// Context type definition
interface AuthContextType {
  currentUser: User | null;
  session: any;
  loading: boolean;
  users: User[];  // Added missing property
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateAvatar: (file: File) => Promise<string>;
  getAllUsers: () => Promise<User[]>;
  blockUser: (userId: string, isBlocked: boolean) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  session: null,
  loading: true,
  users: [], // Added missing property
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  logout: async () => {}, // Alias for signOut
  resetPassword: async () => {},
  updateProfile: async () => {},
  updateAvatar: async () => "",
  getAllUsers: async () => [],
  blockUser: async () => {},
});

// Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]); // Store all users
  const navigate = useNavigate();

  // Initialize user session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        
        if (session) {
          // Get user profile data
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          
          if (profileError) throw profileError;
          
          // Transform profile data to match User interface
          const userData: User = {
            id: profile.id,
            username: profile.username,
            role: profile.role as "admin" | "user",
            points: profile.points,
            isBlocked: profile.is_blocked || false,
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at,
            email: profile.email,
            emailVerified: profile.email_verified
          };
          
          setCurrentUser(userData);

          // Also load all users if admin
          if (userData.role === "admin") {
            await loadAllUsers();
          }
        }
      } catch (error: any) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        
        if (session) {
          try {
            // Get user profile data
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            
            if (profileError) throw profileError;
            
            // Transform profile data to match User interface
            const userData: User = {
              id: profile.id,
              username: profile.username,
              role: profile.role as "admin" | "user",
              points: profile.points,
              isBlocked: profile.is_blocked || false,
              avatarUrl: profile.avatar_url,
              createdAt: profile.created_at,
              email: profile.email,
              emailVerified: profile.email_verified
            };
            
            setCurrentUser(userData);

            // Also load all users if admin
            if (userData.role === "admin") {
              await loadAllUsers();
            }
          } catch (error: any) {
            console.error("Error fetching user profile:", error);
          }
        } else {
          setCurrentUser(null);
          setUsers([]);
        }
      }
    );

    initSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Load all users (for admin usage)
  const loadAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("username");
      
      if (error) throw error;
      
      // Transform profile data to match User interface
      const usersData: User[] = data.map(profile => ({
        id: profile.id,
        username: profile.username,
        role: profile.role as "admin" | "user",
        points: profile.points,
        isBlocked: profile.is_blocked || false,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
        email: profile.email,
        emailVerified: profile.email_verified
      }));
      
      setUsers(usersData);
    } catch (error: any) {
      console.error("Error loading users:", error);
    }
  };

  // Get all users (admin only)
  const getAllUsers = async (): Promise<User[]> => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Unauthorized");
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("username");
      
      if (error) throw error;
      
      // Transform profile data to match User interface
      const usersData: User[] = data.map(profile => ({
        id: profile.id,
        username: profile.username,
        role: profile.role as "admin" | "user",
        points: profile.points,
        isBlocked: profile.is_blocked || false,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
        email: profile.email,
        emailVerified: profile.email_verified
      }));
      
      // Update the users state
      setUsers(usersData);
      
      return usersData;
    } catch (error: any) {
      console.error("Error getting users:", error);
      throw error;
    }
  };

  // Block/unblock user (admin only)
  const blockUser = async (userId: string, isBlocked: boolean): Promise<void> => {
    try {
      if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Unauthorized");
      }
      
      const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: isBlocked })
        .eq("id", userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, isBlocked } : user
      ));
      
      toast.success(`User ${isBlocked ? "blocked" : "unblocked"} successfully`);
    } catch (error: any) {
      toast.error(`Failed to ${isBlocked ? "block" : "unblock"} user: ${error.message}`);
      throw error;
    }
  };

  // Login function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      if (data?.session) {
        // Check if user is blocked
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_blocked")
          .eq("id", data.session.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profile.is_blocked) {
          await supabase.auth.signOut();
          toast.error("Your account has been blocked. Please contact an administrator.");
          throw new Error("Account blocked");
        }
        
        toast.success("Signed in successfully");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      setUsers([]);
      navigate("/login");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Alias for signOut function 
  const logout = signOut;

  // Register function
  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            fullName,
          },
        },
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      if (data) {
        toast.success("Account created successfully! You can now sign in.");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      if (!currentUser) {
        throw new Error("Not authenticated");
      }
      
      // Transform data to match the profiles table schema
      const profileData = {
        username: data.username,
        role: data.role,
        points: data.points,
        avatar_url: data.avatarUrl
      };
      
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", currentUser.id);
      
      if (error) throw error;
      
      // Update local state
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          ...data,
        });
      }
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`);
      throw error;
    }
  };

  // Upload and update user avatar
  const updateAvatar = async (file: File): Promise<string> => {
    try {
      if (!currentUser) {
        throw new Error("Not authenticated");
      }
      
      // Define file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}.${fileExt}`;
      const filePath = fileName;
      
      // Upload avatar image
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      
      const avatarUrl = data.publicUrl;
      
      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", currentUser.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        avatarUrl,
      });
      
      toast.success("Avatar updated successfully");
      
      return avatarUrl;
    } catch (error: any) {
      toast.error(`Failed to update avatar: ${error.message}`);
      throw error;
    }
  };

  const value = {
    currentUser,
    session,
    loading,
    users,
    signIn,
    signUp,
    signOut,
    logout,
    resetPassword,
    updateProfile,
    updateAvatar,
    getAllUsers,
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
