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
  sendVerificationEmail:email: string) => Promise<void>;
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
          setSession(session);
          if (session?.user) {
            try {
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

  // ... (loadAllUsers, getAllUsers, blockUser functions remain the same) ...
  const loadAllUsers = async () => { /* ... */ };
  const getAllUsers = async (): Promise<User[]> => { /* ... */ };
  const blockUser = async (userId: string, isBlocked: boolean): Promise<void> => { /* ... */ };


  // Login function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data?.session?.user) {
        // Use the robust helper to get profile
        const userData = await getOrCreateProfile(data.session.user.id, data.session.user.email);
        
        if (userData.isBlocked) {
          await supabase.auth.signOut();
          toast.error("Your account has been blocked. Please contact an administrator.");
          throw new Error("Account blocked");
        }
        
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
  const signOut = async () => { /* ... */ };
  const logout = signOut;

  // Register function - simplified to rely on the trigger
  const signUp = async (email: string, password: string, username: string, fullName: string = "") => {
    try {
      setLoading(true);
      
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();
      
      if (existingUser) {
        throw new Error("Username already exists. Please choose another.");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, fullName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
      
      toast.success("Account created! Please check your email for verification.");
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to create account");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ... (All other functions like sendVerificationEmail, resetPassword, etc. remain the same) ...
  const sendVerificationEmail = async (email: string) => { /* ... */ };
  const resetPassword = async (email: string) => { /* ... */ };
  const changeEmail = async (newEmail: string) => { /* ... */ };
  const changePassword = async (oldPassword: string, newPassword: string) => { /* ... */ };
  const updateProfile = async (data: Partial<User>): Promise<void> => { /* ... */ };
  const updateAvatar = async (file: File): Promise<string> => { /* ... */ };

  const value = {
    currentUser, session, loading, users, signIn, signUp, signOut, logout,
    resetPassword, updateProfile, updateAvatar, getAllUsers, blockUser,
    sendVerificationEmail, changeEmail, changePassword
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
