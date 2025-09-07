import React from 'react'
import { useAuth } from '../context/authContext';
import { AdminSidebarNew } from '../components/admin/AdminSidebarNew';
import { Outlet } from 'react-router-dom';
import { User } from 'lucide-react';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { ThemeToggle } from "../components/ui/theme-toggle";
import RoleSwitcher from '../components/common/RoleSwitcher';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <AdminSidebarNew />
      <SidebarInset className="flex flex-col overflow-x-hidden">
        <nav className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          
          <div className="text-center flex-1">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">American Completion Tools</h1>
          </div>

          <div className="flex items-center gap-4 px-4">
            <RoleSwitcher />
            <ThemeToggle />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </nav>
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AdminDashboard;