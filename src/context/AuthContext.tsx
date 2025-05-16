
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Extend the User type with the properties we need
interface ExtendedUser extends User {
  username?: string;
  points?: number;
  role?: 'admin' | 'user';
  created_at?: string;
}

interface AuthContextType {
  currentUser: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  users: ExtendedUser[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, metadata: Record<string, any>) => Promise<boolean>;
  updateUserPoints: (userId: string, pointsToAdd: number) => Promise<boolean>;
  updateUser: (userId: string, data: Partial<ExtendedUser>) => Promise<boolean>;
  addUser: (userData: Partial<ExtendedUser>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ExtendedUser[]>([]);

  // Fetch users function
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error("Error fetching users:", error);
        return;
      }
      
      // Map Supabase profiles to our extended user type
      const formattedUsers = data.map(profile => ({
        id: profile.id,
        username: profile.username,
        email: profile.email,
        points: profile.points || 0,
        role: profile.role as 'admin' | 'user',
        created_at: profile.created_at
      })) as ExtendedUser[];
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile data to get additional information
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error("Error fetching user profile:", error);
                setCurrentUser(session.user);
                return;
              }
              
              // Merge auth user with profile data
              const extendedUser: ExtendedUser = {
                ...session.user,
                username: data.username,
                points: data.points || 0,
                role: data.role
              };
              
              setCurrentUser(extendedUser);
            });
          
          // Refresh the users list when auth state changes
          fetchUsers();
        } else {
          setCurrentUser(null);
        }
        
        // Notify user on successful login or sign up
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You've been signed out successfully.",
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        // Fetch additional user data
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error("Error fetching user profile:", error);
              setCurrentUser(session.user);
              setLoading(false);
              return;
            }
            
            // Merge auth user with profile data
            const extendedUser: ExtendedUser = {
              ...session.user,
              username: data.username,
              points: data.points || 0,
              role: data.role
            };
            
            setCurrentUser(extendedUser);
            setLoading(false);
          });
        
        // Load all users for admin features
        fetchUsers();
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const register = async (
    email: string,
    password: string, 
    metadata: Record<string, any>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateUserPoints = async (userId: string, pointsToAdd: number): Promise<boolean> => {
    try {
      // First get the current points
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error("Error fetching user points:", fetchError);
        return false;
      }

      const currentPoints = userData.points || 0;
      const newPoints = currentPoints + pointsToAdd;

      // Update the points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating user points:", updateError);
        return false;
      }

      // Update local state if the current user is being modified
      if (currentUser && currentUser.id === userId) {
        setCurrentUser({
          ...currentUser,
          points: newPoints
        });
      }

      // Update the users array
      setUsers(users.map(user => 
        user.id === userId ? { ...user, points: newPoints } : user
      ));

      return true;
    } catch (error) {
      console.error("Update user points error:", error);
      return false;
    }
  };

  const updateUser = async (userId: string, data: Partial<ExtendedUser>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          role: data.role,
          // Add other fields as needed
        })
        .eq('id', userId);

      if (error) {
        console.error("Error updating user:", error);
        return false;
      }

      // Update local state if the current user is being modified
      if (currentUser && currentUser.id === userId) {
        setCurrentUser({
          ...currentUser,
          ...data
        });
      }

      // Update the users array
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...data } : user
      ));

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      return true;
    } catch (error: any) {
      console.error("Update user error:", error);
      toast({
        title: "Update failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const addUser = async (userData: Partial<ExtendedUser>): Promise<boolean> => {
    try {
      // In a real app, you'd want to use admin functions or edge functions
      // to create users safely. This is a simplified example.
      const { error } = await supabase.auth.admin.createUser({
        email: userData.email as string,
        password: Math.random().toString(36).slice(-8), // Generate a random password
        email_confirm: true,
        user_metadata: {
          username: userData.username,
          role: userData.role || 'user',
        }
      });

      if (error) {
        console.error("Error creating user:", error);
        return false;
      }

      // Refresh the user list
      await fetchUsers();

      toast({
        title: "Success",
        description: "User created successfully",
      });

      return true;
    } catch (error: any) {
      console.error("Add user error:", error);
      toast({
        title: "User creation failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        session,
        loading,
        users,
        login,
        logout,
        register,
        updateUserPoints,
        updateUser,
        addUser
      }}
    >
      {!loading && children}
      {loading && <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
