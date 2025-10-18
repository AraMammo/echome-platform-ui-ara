"use client";

import React, { useEffect } from "react";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/organisms/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { AuthGuard } from "@/components/atoms/auth-guard";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
          <main className="p-10 w-full max-w-full overflow-hidden">
            {/* AuthGuard disabled for testing */}
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
