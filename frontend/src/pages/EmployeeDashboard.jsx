import React from 'react';
import { useAuth } from '../context/authContext';
import { EmployeeSidebarNew } from '../components/employee/EmployeeSidebarNew';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import TimeOffCard from '../components/employee/TimeOffCard';
import NotificationsCard from '../components/employee/NotificationsCard';
import MyTeamCard from '../components/employee/MyTeamCard';
import TasksCard from '../components/employee/TasksCard';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Only show the dashboard content on the main route
  const showDashboard = location.pathname === '/employee-dashboard';

  return (
    <SidebarProvider>
      <EmployeeSidebarNew />
      <SidebarInset>
        <nav className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          
          <div className="text-center flex-1">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">American Completion Tools</h1>
          </div>

          <div className="flex items-center gap-4 px-4">
            <ThemeToggle />
            <button className="text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </nav>

        {showDashboard && (
          <div className="container mx-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Hi, {user?.name || 'Welcome'}! 👋</h2>
              <p className="text-muted-foreground">Here's what's happening with your team today.</p>
            </div>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TimeOffCard />
                <TasksCard />
                <NotificationsCard />
              </div>
              <MyTeamCard />
            </div>
          </div>
        )}
        {!showDashboard && <Outlet />}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default EmployeeDashboard;
