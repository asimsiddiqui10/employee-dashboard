import React, { useEffect, useState } from 'react';
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
import TimeClockCard from '../components/employee/TimeClockCard';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [displayText, setDisplayText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    // Clear previous animation state
    setDisplayText('');
    setShowEmoji(false);

    // Make sure we have valid user data
    if (!user?.name) {
      setDisplayText('Hi, Welcome!');
      return;
    }

    // Prepare the full greeting text
    const greeting = `Hi, ${user.name}!`;
    let timeouts = [];

    // Animate each letter
    for (let i = 0; i < greeting.length; i++) {
      const timeout = setTimeout(() => {
        setDisplayText(greeting.slice(0, i + 1));
        // Show emoji after last letter
        if (i === greeting.length - 1) {
          setTimeout(() => setShowEmoji(true), 200);
        }
      }, i * 100);
      timeouts.push(timeout);
    }

    // Cleanup function to clear all timeouts
    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, [user?.name]); // Only re-run if user name changes

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
              <h2 className="text-2xl font-semibold">
                <span>{displayText}</span>
                {showEmoji && (
                  <span 
                    className="ml-2 inline-block"
                    style={{
                      animation: 'waveAndGrow 1s ease-in-out'
                    }}
                  >
                    👋
                  </span>
                )}
              </h2>
              <p className="text-muted-foreground">Here's what's happening with your team today.</p>
            </div>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <NotificationsCard />
                <TimeOffCard />
                <TimeClockCard />
              </div>
              <MyTeamCard />
            </div>
          </div>
        )}
        {!showDashboard && <Outlet />}
      </SidebarInset>

      <style jsx>{`
        @keyframes waveAndGrow {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.3) rotate(15deg); }
          50% { transform: scale(1.3) rotate(30deg); }
          75% { transform: scale(1.3) rotate(15deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </SidebarProvider>
  );
};

export default EmployeeDashboard;
