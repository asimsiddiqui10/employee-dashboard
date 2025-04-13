import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Bell, 
  FileText,
  Building2,
  Calendar,
  BarChart2,
  FolderKanban,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  DollarSign,
  GraduationCap
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
      icon: Home,
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
      title: "Documents",
      icon: FileText,
      path: "/admin-dashboard/documents"
    },
    {
      title: "Leave",
      icon: Calendar,
      path: "/admin-dashboard/leave"
    },
    {
      title: "Payroll",
      icon: DollarSign,
      path: "/admin-dashboard/payroll"
    },
    {
      title: "Training",
      icon: GraduationCap,
      path: "/admin-dashboard/training"
    },
    {
      title: "Departments",
      icon: Building2,
      path: "/admin-dashboard/departments"
    },
    {
      title: "Projects",
      icon: FolderKanban,
      path: "/admin-dashboard/projects"
    },
    {
      title: "Analytics",
      icon: BarChart2,
      path: "/admin-dashboard/analytics"
    }
  ];

  const bottomMenuItems = [
    {
      title: "Settings",
      icon: Settings,
      path: "/admin-dashboard/settings"
    },
    {
      title: "Get Help",
      icon: HelpCircle,
      path: "/admin-dashboard/help"
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
                  className="flex w-full items-center gap-2 pr-3 text-muted-foreground hover:text-foreground"
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
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
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