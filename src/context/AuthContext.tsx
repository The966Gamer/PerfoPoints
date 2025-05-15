
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@/types";

// Modified database for Mom and Dad as admins, kids as users
const DEMO_USERS: User[] = [
  {
    id: "admin1",
    username: "Mom",
    role: "admin",
    points: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "admin2",
    username: "Dad",
    role: "admin",
    points: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user1",
    username: "Kid1",
    role: "user",
    points: 75,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user2",
    username: "Kid2",
    role: "user",
    points: 120,
    createdAt: new Date().toISOString(),
  }
];

// To simulate a basic hash for demo purposes
const hashPassword = (password: string) => {
  return password.split('').reverse().join('');
};

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string, role: "admin" | "user") => Promise<boolean>;
  addUser: (username: string, password: string) => Promise<boolean>;
  updateUser: (user: User) => Promise<void>;
  updateUserPoints: (userId: string, points: number) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple storage for demo - store just usernames and passwords
const DEMO_AUTH = {
  "Mom": hashPassword("mom123"),
  "Dad": hashPassword("dad123"),
  "Kid1": hashPassword("kid123"),
  "Kid2": hashPassword("kid456"),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);
  
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call to Firebase Auth
      const hashedPassword = hashPassword(password);
      
      if (DEMO_AUTH[username] === hashedPassword) {
        const user = users.find(u => u.username === username);
        if (user) {
          if (user.isBlocked) {
            toast.error("This account has been blocked. Please contact an administrator.");
            return false;
          }
          
          setCurrentUser(user);
          localStorage.setItem("currentUser", JSON.stringify(user));
          toast.success(`Welcome back, ${username}!`);
          return true;
        }
      }
      
      toast.error("Invalid username or password");
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again later.");
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    toast.info("You've been logged out");
  };

  const register = async (username: string, password: string, role: "admin" | "user"): Promise<boolean> => {
    try {
      // Check if username already exists
      if (users.some(u => u.username === username)) {
        toast.error("Username already exists");
        return false;
      }
      
      // Check if trying to register as admin with reserved names
      if (role === "admin" && !["Mom", "Dad"].includes(username)) {
        toast.error("Only 'Mom' and 'Dad' can be administrators");
        return false;
      }
      
      // In a real app, this would create a new user in Firebase Auth
      const hashedPassword = hashPassword(password);
      DEMO_AUTH[username] = hashedPassword;
      
      const newUser: User = {
        id: `user${users.length + 1}`,
        username,
        role,
        points: 0,
        createdAt: new Date().toISOString(),
      };
      
      setUsers(prev => [...prev, newUser]);
      
      toast.success("Registration successful! You can now login.");
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again later.");
      return false;
    }
  };

  const addUser = async (username: string, password: string): Promise<boolean> => {
    if (!currentUser || currentUser.role !== "admin") {
      toast.error("Only administrators can add users");
      return false;
    }
    
    return register(username, password, "user");
  };

  const updateUser = async (updatedUser: User): Promise<void> => {
    try {
      setUsers(prev => 
        prev.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      
      // If updating the current user, update that as well
      if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }
      
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update user");
    }
  };
  
  const updateUserPoints = async (userId: string, points: number): Promise<void> => {
    try {
      setUsers(prev => 
        prev.map(user => {
          if (user.id === userId) {
            const updatedUser = { ...user, points: user.points + points };
            return updatedUser;
          }
          return user;
        })
      );
      
      // If updating the current user, update that as well
      if (currentUser?.id === userId) {
        const updatedUser = { ...currentUser, points: currentUser.points + points };
        setCurrentUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Update points error:", error);
      toast.error("Failed to update user points");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        register,
        addUser,
        updateUser,
        updateUserPoints,
        loading,
      }}
    >
      {!loading && children}
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
