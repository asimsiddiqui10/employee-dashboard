import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/authContext';

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
    title: "Payroll",
    icon: DollarSign,
    path: "/employee-dashboard/payroll"
  },
  {
    title: "Notifications",
    icon: Bell,
    path: "/employee-dashboard/notifications"
  },
  {
    title: "Time Tracking",
    icon: Clock,
    path: "/employee-dashboard/time-tracking"
  },
  {
    title: "Leave Management",
    icon: CalendarDays,
    path: "/employee-dashboard/leave"
  },
  {
    title: "Announcements",
    icon: Megaphone,
    path: "/employee-dashboard/announcements"
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
    title: "Documents",
    icon: FileText,
    path: "/employee-dashboard/documents"
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
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.path}
                    end={item.path === '/employee-dashboard'}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-accent text-accent-foreground' 
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`
                    }
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </span>
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
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-2 pr-3 ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
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
              onClick={logout}
              className="flex w-full items-center gap-2 pr-3 text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}