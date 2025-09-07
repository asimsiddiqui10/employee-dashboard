import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../hooks/use-toast';
import api from '../../lib/axios';
import { handleApiError } from '../../utils/errorHandler';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ChevronDown, UserCheck, Shield, User, RefreshCw } from 'lucide-react';

const RoleSwitcher = ({ className = "" }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

  // Helper functions
  const getActiveRole = () => {
    if (!user) return null;
    return user.activeRole || user.role || (user.roles && user.roles[0]);
  };

  const getAvailableRoles = () => {
    if (!user) return [];
    return user.roles || (user.role ? [user.role] : []);
  };

  const canSwitchRoles = () => {
    if (!user) return false;
    const userRoles = user.roles || (user.role ? [user.role] : []);
    return userRoles.length > 1;
  };

  const activeRole = getActiveRole();
  const availableRoles = getAvailableRoles();

  // Don't render if user can't switch roles
  if (!canSwitchRoles()) {
    return null;
  }

  const switchRole = async (newRole) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    const userRoles = user.roles || (user.role ? [user.role] : []);
    if (!userRoles.includes(newRole)) {
      throw new Error(`You don't have access to the ${newRole} role`);
    }

    setRoleLoading(true);
    try {
      const response = await api.post('/roles/switch', { newRole });
      
      if (response.data.success) {
        // Store active role in localStorage for persistence
        localStorage.setItem('activeRole', newRole);
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to switch role');
      }
    } catch (error) {
      const { message } = handleApiError(error);
      throw new Error(message);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleRoleSwitch = async (newRole) => {
    // Prevent multiple simultaneous role switches
    if (newRole === activeRole || roleLoading) return;

    try {
      await switchRole(newRole);
      
      toast({
        title: "Role Switched",
        description: `Successfully switched to ${newRole} role.`,
        variant: "default",
      });

      // Navigate to appropriate dashboard
      if (newRole === 'admin') {
        navigate('/admin-dashboard');
      } else if (newRole === 'employee') {
        navigate('/employee-dashboard');
      }
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Role Switch Failed",
        description: error.message || "Failed to switch role",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'employee':
        return <User className="h-4 w-4" />;
      default:
        return <UserCheck className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'employee':
        return 'Employee';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'employee':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center gap-2 ${className}`}
          disabled={roleLoading}
        >
          {roleLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            getRoleIcon(activeRole)
          )}
          <span className="hidden sm:inline">
            {getRoleLabel(activeRole)}
          </span>
          <Badge 
            variant={getRoleBadgeVariant(activeRole)} 
            className="text-xs hidden md:inline-flex"
          >
            Active
          </Badge>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Switch Role</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.name || user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {availableRoles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleRoleSwitch(role)}
            className={`flex items-center gap-2 cursor-pointer ${
              role === activeRole ? 'bg-muted' : ''
            }`}
            disabled={roleLoading}
          >
            {getRoleIcon(role)}
            <span className="flex-1">{getRoleLabel(role)}</span>
            {role === activeRole && (
              <Badge variant={getRoleBadgeVariant(role)} className="text-xs">
                Current
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
          <UserCheck className="h-3 w-3 mr-2" />
          Available Roles: {availableRoles.length}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleSwitcher; 