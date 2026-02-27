import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bell,
  DollarSign,
  Clock,
  CalendarDays,
  Building2,
  Megaphone,
  InboxIcon,
  CheckSquare,
  Receipt,
  FolderClosed,
  GraduationCap,
  Gift,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  CheckCircle,
  FileText,
  Calendar,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useSidebar } from '../ui/sidebar';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../ui/sidebar";

export function AdminSidebarNew() {
  const { logout } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const mainMenuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin-dashboard"
    },
    {
      title: "Employees",
      icon: Users,
      path: "/admin-dashboard/employees"
    },
    
    {
      title: "Notifications",
      icon: Bell,
      path: "/admin-dashboard/notifications"
    },
    {
      title: "Payroll",
      icon: DollarSign,
      path: "/admin-dashboard/payroll"
    },
    {
      title: "Hours",
      icon: Clock,
      path: "/admin-dashboard/time-tracking"
    },
    {
      title: "Schedules",
      icon: Calendar,
      path: "/admin-dashboard/schedules"
    },
    {
      title: "Departments",
      icon: Building2,
      path: "/admin-dashboard/departments"
    },
    {
      title: "Onboarding",
      icon: UserPlus,
      path: "/admin-dashboard/onboarding"
    },
    {
      title: "Job Codes",
      icon: GraduationCap,
      path: "/admin-dashboard/job-codes"
    },
    {
      title: "Documents",
      icon: FolderClosed,
      path: "/admin-dashboard/documents"
    },
    {
      title: "Leave",
      icon: CalendarDays,
      path: "/admin-dashboard/leave"
    },
    
    {
      title: "Requests",
      icon: FileText,
      path: "/admin-dashboard/requests"
    },
    {
      title: "Reimbursements",
      icon: Receipt,
      path: "/admin-dashboard/reimbursements"
    },
    {
      title: "Meetings",
      icon: Calendar,
      path: "/admin-dashboard/meetings"
    },
    {
      title: "Tasks & Projects",
      icon: CheckSquare,
      path: "/admin-dashboard/tasks"
    },
    
    {
      title: "Training",
      icon: GraduationCap,
      path: "/admin-dashboard/training"
    },
    {
      title: "Benefits",
      icon: Gift,
      path: "/admin-dashboard/benefits"
    },
  ];

  const bottomMenuItems = [
    {
      title: "Settings",
      icon: Settings,
      path: "/admin-dashboard/settings"
    },
    {
      title: "Feedback",
      icon: MessageSquare,
      path: "/admin-dashboard/feedback"
    },
    {
      title: "Logout",
      icon: LogOut,
      onClick: () => {
        if (isMobile) {
          setOpenMobile(false);
        }
        logout();
      }
    }
  ];

  const isActive = (path) => {
    if (path === '/admin-dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Menu className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Admin Dashboard</span>
                  <span className="text-xs text-muted-foreground">ACT</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={location.pathname === item.path || (item.path !== '/admin-dashboard' && location.pathname.startsWith(item.path))}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/admin-dashboard'}
                    onClick={handleNavigation}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        location.pathname === item.path || (item.path !== '/admin-dashboard' && location.pathname.startsWith(item.path))
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.onClick ? (
                <SidebarMenuButton 
                  onClick={item.onClick}
                  className="flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-red-500 hover:text-red-600 hover:bg-red-100/50 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild isActive={location.pathname === item.path || location.pathname.startsWith(item.path)}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/admin-dashboard'}
                    onClick={handleNavigation}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        location.pathname === item.path || location.pathname.startsWith(item.path)
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
} 