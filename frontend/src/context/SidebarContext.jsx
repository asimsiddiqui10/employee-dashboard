import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext({
  isMobile: false,
  setOpenMobile: () => {},
});

export function SidebarProvider({ children }) {
  const [openMobile, setOpenMobile] = useState(false);

  // Check if we're on mobile based on window width
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const value = {
    isMobile,
    openMobile,
    setOpenMobile,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
} 