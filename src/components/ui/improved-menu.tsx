
import * as React from "react"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  AlertCircle,
  Bell,
  Gift,
  Home,
  LogOut,
  Mail,
  Settings,
  Star,
  User,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function ImprovedMenu() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to log out")
    }
  }

  return (
    <Menubar className="rounded-none border-b border-none px-2 lg:px-4 h-16 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <MenubarMenu>
          <MenubarTrigger onClick={() => handleNavigate('/dashboard')} className="font-bold text-xl p-2">
            PerfoPoints
          </MenubarTrigger>
        </MenubarMenu>
        
        {currentUser && (
          <>
            <MenubarMenu>
              <MenubarTrigger onClick={() => handleNavigate('/dashboard')}>
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </MenubarTrigger>
            </MenubarMenu>
            
            <MenubarMenu>
              <MenubarTrigger onClick={() => handleNavigate('/tasks')}>
                <Star className="w-4 h-4 mr-2" />
                Tasks
              </MenubarTrigger>
            </MenubarMenu>
            
            <MenubarMenu>
              <MenubarTrigger onClick={() => handleNavigate('/rewards')}>
                <Gift className="w-4 h-4 mr-2" />
                Rewards
              </MenubarTrigger>
            </MenubarMenu>
            
            {currentUser.role === "admin" && (
              <MenubarMenu>
                <MenubarTrigger onClick={() => handleNavigate('/users')}>
                  <User className="w-4 h-4 mr-2" />
                  Users
                </MenubarTrigger>
              </MenubarMenu>
            )}
          </>
        )}
      </div>
      
      {currentUser ? (
        <div className="flex items-center gap-2">
          <MenubarMenu>
            <MenubarTrigger className="p-1">
              <Bell className="h-5 w-5" />
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem>No new notifications</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          
          <MenubarMenu>
            <MenubarTrigger className="p-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatarUrl || ''} />
                <AvatarFallback>
                  {currentUser.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled className="flex flex-col items-start p-4">
                <div className="font-medium">{currentUser.username}</div>
                <div className="text-muted-foreground text-xs">{currentUser.email}</div>
                <Badge variant="outline" className="mt-1">{currentUser.role}</Badge>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => handleNavigate('/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
                <MenubarShortcut>⌘P</MenubarShortcut>
              </MenubarItem>
              {!currentUser.emailVerified && currentUser.email && (
                <MenubarItem className="text-amber-500">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span>Email not verified</span>
                </MenubarItem>
              )}
              <MenubarSeparator />
              <MenubarItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
                <MenubarShortcut>⌘Q</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </div>
      ) : (
        <MenubarMenu>
          <MenubarTrigger onClick={() => handleNavigate('/login')}>
            Login / Register
          </MenubarTrigger>
        </MenubarMenu>
      )}
    </Menubar>
  )
}
