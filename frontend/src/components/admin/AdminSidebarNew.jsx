import React from 'react';
import { NavLink } from 'react-router-dom';
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
  LineChart,
  MessageSquare,
  Settings,
  HelpCircle,
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

export function AdminSidebarNew() {
  const { logout } = useAuth();

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
      title: "Time Tracking",
      icon: Clock,
      path: "/admin-dashboard/time-tracking"
    },
    {
      title: "Leave Management",
      icon: CalendarDays,
      path: "/admin-dashboard/leave"
    },
    {
      title: "Departments",
      icon: Building2,
      path: "/admin-dashboard/departments"
    },
    {
      title: "Announcements",
      icon: Megaphone,
      path: "/admin-dashboard/announcements"
    },
    {
      title: "Requests",
      icon: InboxIcon,
      path: "/admin-dashboard/requests"
    },
    {
      title: "Tasks & Projects",
      icon: CheckSquare,
      path: "/admin-dashboard/tasks"
    },
    {
      title: "Expenses",
      icon: Receipt,
      path: "/admin-dashboard/expenses"
    },
    {
      title: "Documents",
      icon: FolderClosed,
      path: "/admin-dashboard/documents"
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
    {
      title: "Insights & Analysis",
      icon: LineChart,
      path: "/admin-dashboard/insights"
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
      onClick: logout
    }
  ];

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
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex w-full items-center gap-2 pr-3 ${
                        isActive
                          ? "text-foreground"
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
                  className="flex w-full items-center gap-2 pr-3 text-red-500 hover:text-red-600 hover:bg-red-100/50 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex w-full items-center gap-2 pr-3 ${
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
      <SidebarRail />
    </Sidebar>
  );
} 