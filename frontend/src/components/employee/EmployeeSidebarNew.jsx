import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  User, 
  Bell, 
  Calendar,
  FileText,
  LogOut,
  Menu,
  DollarSign,
  Users,
  Building,
  GraduationCap,
  Heart
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
  SidebarGroupLabel,
} from "../ui/sidebar";

const sidebarData = [
  {
    title: "Home",
    icon: Home,
    path: "/employee-dashboard"
  },
  {
    title: "My Details",
    icon: User,
    path: "/employee-dashboard/my-details"
  },
  {
    title: "Notifications",
    icon: Bell,
    path: "/employee-dashboard/notifications"
  },
  {
    title: "Payroll",
    icon: DollarSign,
    path: "/employee-dashboard/payroll"
  },
  {
    title: "Leave",
    icon: Calendar,
    path: "/employee-dashboard/leave"
  }
];

const documentLinks = [
  {
    title: "Personal",
    icon: User,
    path: "/employee-dashboard/documents/personal"
  },
  {
    title: "Company",
    icon: Building,
    path: "/employee-dashboard/documents/company"
  },
  {
    title: "Onboarding",
    icon: GraduationCap,
    path: "/employee-dashboard/documents/onboarding"
  },
  {
    title: "Benefits",
    icon: Heart,
    path: "/employee-dashboard/documents/benefits"
  },
  {
    title: "Training",
    icon: GraduationCap,
    path: "/employee-dashboard/documents/training"
  }
];

export function EmployeeSidebarNew({ ...props }) {
  const { logout } = useAuth();

  return (
    <Sidebar {...props}>
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
                      `flex items-center gap-2 pr-3 ${
                        isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
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

        <SidebarGroup>
          <SidebarGroupLabel>Documents</SidebarGroupLabel>
          <SidebarMenu>
            {documentLinks.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 pr-3 ${
                        isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
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
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout}
              className="flex w-full items-center gap-2 pr-3 text-muted-foreground hover:text-foreground"
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