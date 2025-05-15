
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";

export function Header() {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <div className="bg-primary rounded-lg p-1">
              <div className="text-primary-foreground font-bold">PP</div>
            </div>
            <span className="font-bold text-lg hidden md:inline-block">Perfo Points</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {currentUser ? (
              <>
                <Link to="/dashboard" className="font-medium transition-colors hover:text-primary">
                  Dashboard
                </Link>
                {currentUser.role === "admin" ? (
                  <>
                    <Link to="/users" className="font-medium transition-colors hover:text-primary">
                      Users
                    </Link>
                    <Link to="/requests" className="font-medium transition-colors hover:text-primary">
                      Requests
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/tasks" className="font-medium transition-colors hover:text-primary">
                      Tasks
                    </Link>
                    <Link to="/rewards" className="font-medium transition-colors hover:text-primary">
                      Rewards
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="font-medium transition-colors hover:text-primary">
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          className="md:hidden" 
          size="sm"
          onClick={toggleMenu}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* User Menu (Desktop) */}
        {currentUser && (
          <div className="hidden md:flex items-center gap-4">
            {currentUser.role === "user" && (
              <div className="flex items-center gap-2 bg-accent px-3 py-1 rounded-full">
                <span className="text-sm font-medium">{currentUser.points}</span>
                <span className="text-xs text-muted-foreground">points</span>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.username}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {currentUser.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => logout()}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-14 z-50 bg-background border-t p-6 md:hidden">
          <nav className="flex flex-col space-y-6">
            {currentUser ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Signed in as {currentUser.username}</span>
                  {currentUser.role === "user" && (
                    <div className="flex items-center gap-2 bg-accent px-3 py-1 rounded-full">
                      <span className="text-sm font-medium">{currentUser.points}</span>
                      <span className="text-xs text-muted-foreground">points</span>
                    </div>
                  )}
                </div>
                <Link 
                  to="/dashboard" 
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                {currentUser.role === "admin" ? (
                  <>
                    <Link 
                      to="/users" 
                      className="text-lg font-medium transition-colors hover:text-primary"
                      onClick={closeMenu}
                    >
                      Users
                    </Link>
                    <Link 
                      to="/requests" 
                      className="text-lg font-medium transition-colors hover:text-primary"
                      onClick={closeMenu}
                    >
                      Requests
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/tasks" 
                      className="text-lg font-medium transition-colors hover:text-primary"
                      onClick={closeMenu}
                    >
                      Tasks
                    </Link>
                    <Link 
                      to="/rewards" 
                      className="text-lg font-medium transition-colors hover:text-primary"
                      onClick={closeMenu}
                    >
                      Rewards
                    </Link>
                  </>
                )}
                <Link 
                  to="/profile" 
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                <button 
                  className="text-lg font-medium transition-colors hover:text-primary text-left"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
