import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function UserProfileDropdown() {
  const [, setLocation] = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isLoading, logoutMutation } = useAuth();
  
  const isAuthenticated = !!user;
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/');
      }
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => setLocation('/auth')}
        >
          Login
        </Button>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => setLocation('/auth')}
        >
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage 
              src={user.profilePicture || ''} 
              alt={user.fullName} 
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          setIsDropdownOpen(false);
          setLocation('/profile');
        }}>
          <i className="fas fa-user mr-2 text-gray-500"></i>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          setIsDropdownOpen(false);
          setLocation('/profile');
          // TODO: Add anchor to itineraries tab
        }}>
          <i className="fas fa-map-marked-alt mr-2 text-gray-500"></i>
          My Itineraries
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="text-red-500 focus:text-red-500"
          disabled={logoutMutation.isPending}
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}