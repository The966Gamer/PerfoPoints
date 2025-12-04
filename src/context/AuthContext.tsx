import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

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
  users: User[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateAvatar: (file: File) => Promise<string>;
  getAllUsers: () => Promise<User[]>;
  blockUser: (userId: string, isBlocked: boolean) => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  session: null,
  loading: true,
  users: [],
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  updateAvatar: async () => "",
  getAllUsers: async () => [],
  blockUser: async () => {},
  sendVerificationEmail: async () => {},
  changeEmail: async () => {},
  changePassword: async () => {},
});

// ====== THE KEY FIX: A ROBUST PROFILE FETCHER ======
// This function gets a profile, and if it doesn't exist, it creates one.
// This solves the race condition and the "Cannot coerce" error.
const getOrCreateProfile = async (userId: string, email?: string, username?: string): Promise<User> => {
  let { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }

  if (!profile) {
    console.log("Profile not found, creating for user:", userId);
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: email,
        username: username,
        role: 'user',
        points: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);
      throw insertError;
    }
    profile = newProfile;
  }
  
  // Transform profile data to match User interface
  return {
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
};


// Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  // Initialize user session on mount
  useEffect(() => {
    const initSession = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event);
          setSession(session);
          if (session?.user) {
            try {
              // Use the robust helper to get or create the profile
              const userData = await getOrCreateProfile(session.user.id, session.user.email, session.user.user_metadata?.username);
              setCurrentUser(userData);
              if (userData.role === "admin") {
                await loadAllUsers();
              }
            } catch (error) {
              console.error("Error in auth state change handler:", error);
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
            setUsers([]);
          }
          setLoading(false);
        }
      );

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const userData = await getOrCreateProfile(session.user.id, session.user.email, session.user.user_metadata?.username);
          setCurrentUser(userData);
          if (userData.role === "admin") {
            await loadAllUsers();
          }
        } catch (error) {
          console.error("Error fetching initial session:", error);
        }
      }
      
      setLoading(false);
      return () => subscription.unsubscribe();
    };

    initSession();
  }, [navigate]);

  // Load all users (for admin usage)
  const loadAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("username");
      
      if (error) throw error;
      
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
      
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, isBlocked } : user
      ));
      
      toast.success(`User ${isBlocked ? "blocked" : "unblocked"} successfully`);
    } catch (error: any) {
      toast.error(`Failed to ${isBlocked ? "block" : "unblock"} user: ${error.message}`);
      throw error;
    }
  };

  // ====== THE CORRECTED LOGIN FUNCTION ======
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
      
      if (data?.session?.user) {
        // Use the robust helper to get or create the profile.
        // This single line fixes both failing API calls.
        const userData = await getOrCreateProfile(data.session.user.id, data.session.user.email, data.session.user.user_metadata?.username);
        
        if (userData.isBlocked) {
          await supabase.auth.signOut();
          toast.error("Your account has been blocked. Please contact an administrator.");
          throw new Error("Account blocked");
        }
        
        setCurrentUser(userData);
        toast.success("Signed in successfully");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to login");
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

  // Register function - now relies on the trigger
  const signUp = async (email: string, password: string, username: string, fullName: string = "") => {
    try {
      setLoading(true);
      
      // First check if username already exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();
      
      if (existingUser) {
        throw new Error("Username already exists. Please choose another username.");
      }
      
      // Proceed with signup with email verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        toast.success("Account created! Please check your email for verification.");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to create account");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send verification email
  const sendVerificationEmail = async (email: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
      
      toast.success("Verification email sent successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
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
        redirectTo: 'https://perfopoints-rest-pass.netlify.app/',
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

  // Change email function
  const changeEmail = async (newEmail: string) => {
    try {
      if (!currentUser) {
        throw new Error("Not authenticated");
      }
      
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) throw error;
      
      // Update profile with new email
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ email: newEmail, email_verified: false })
        .eq("id", currentUser.id);
      
      if (profileError) throw profileError;
      
      toast.success("Email update initiated. Please check your new email for verification.");
    } catch (error: any) {
      toast.error(`Failed to update email: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Change password function
  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      if (!currentUser) {
        throw new Error("Not authenticated");
      }
      
      setLoading(true);
      
      // First verify old password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email || "",
        password: oldPassword
      });
      
      if (signInError) {
        toast.error("Current password is incorrect");
        throw signInError;
      }
      
      // Then update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
    } catch (error: any) {
      toast.error(`Failed to update password: ${error.message}`);
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
      
      const profileData: any = {
        username: data.username,
        role: data.role,
        points: data.points,
        avatar_url: data.avatarUrl
      };
      
      const updateId = data.id || currentUser.id;
      
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", updateId);
      
      if (error) throw error;
      
      if (updateId === currentUser.id) {
        setCurrentUser({
          ...currentUser,
          ...data,
        });
      } else {
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === updateId ? { ...user, ...data } : user
        ));
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
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}.${fileExt}`;
      const filePath = fileName;
      
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      
      const avatarUrl = data.publicUrl;
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", currentUser.id);
      
      if (updateError) throw updateError;
      
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
    sendVerificationEmail,
    changeEmail,
    changePassword
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
