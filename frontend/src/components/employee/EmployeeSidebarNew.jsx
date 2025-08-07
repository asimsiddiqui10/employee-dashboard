import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  User,
  DollarSign,
  Bell,
  Clock,
  CalendarDays,
  Megaphone,
  InboxIcon,
  CheckSquare,
  Receipt,
  FileText,
  Users2,
  GraduationCap,
  Gift,
  LineChart,
  MessageSquare,
  LogOut,
  Menu,
  Calendar
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

const sidebarData = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/employee-dashboard"
  },
  {
    title: "My Profile",
    icon: User,
    path: "/employee-dashboard/my-details"
  },
 
  {
    title: "Notifications",
    icon: Bell,
    path: "/employee-dashboard/notifications"
  },
  {
    title: "Hours",
    icon: Clock,
    path: "/employee-dashboard/time-tracking"
  },

  {
    title: "Payroll",
    icon: DollarSign,
    path: "/employee-dashboard/payroll"
  },

  {
    title: "Leave",
    icon: CalendarDays,
    path: "/employee-dashboard/leave"
  },

  {
    title: "Documents",
    icon: FileText,
    path: "/employee-dashboard/documents"
  },
  
  {
    title: "Meetings",
    icon: Calendar,
    path: "/employee-dashboard/meetings"
  },
  {
    title: "Requests",
    icon: InboxIcon,
    path: "/employee-dashboard/requests"
  },
  {
    title: "Tasks & Projects",
    icon: CheckSquare,
    path: "/employee-dashboard/tasks"
  },
  {
    title: "Reimbursements",
    icon: Receipt,
    path: "/employee-dashboard/reimbursements"
  },
  {
    title: "My Team",
    icon: Users2,
    path: "/employee-dashboard/team"
  },
  {
    title: "Training",
    icon: GraduationCap,
    path: "/employee-dashboard/training"
  },
  {
    title: "Benefits",
    icon: Gift,
    path: "/employee-dashboard/benefits"
  },
  {
    title: "Reports",
    icon: LineChart,
    path: "/employee-dashboard/reports"
  }
];

const bottomMenuItems = [
  {
    title: "Feedback",
    icon: MessageSquare,
    path: "/employee-dashboard/feedback"
  }
];

export function EmployeeSidebarNew() {
  const { logout } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  const handleNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isActive = (path) => {
    if (path === '/employee-dashboard') {
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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Menu className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Employee Dashboard</span>
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
            {sidebarData.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={location.pathname === item.path || (item.path !== '/employee-dashboard' && location.pathname.startsWith(item.path))}>
                  <NavLink 
                    to={item.path}
                    end={item.path === '/employee-dashboard'}
                    onClick={handleNavigation}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                        location.pathname === item.path || (item.path !== '/employee-dashboard' && location.pathname.startsWith(item.path))
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
              <SidebarMenuButton asChild isActive={location.pathname === item.path || location.pathname.startsWith(item.path)}>
                <NavLink
                  to={item.path}
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
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                }
                logout();
              }}
              className="flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-red-500 hover:text-red-600 hover:bg-red-100/50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}