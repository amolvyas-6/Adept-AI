import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { AppDataProvider } from "@/contexts/app-data-context";
import { AppSidebar } from "./app-sidebar";
import { FloatingThemeToggle } from "./mode-toggle";
import { Loader2 } from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// Map routes to page titles
const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/documents": "Documents",
  "/library": "My Library",
  "/profile": "Profile",
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/chats/")) return "Chat";
  return pageTitles[pathname] || "Dashboard";
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, isAuthenticated, isProfileComplete } = useAuth();

  const currentPageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    } else if (!isProfileComplete) {
      navigate("/complete-profile", { replace: true });
    }
  }, [loading, isAuthenticated, isProfileComplete, navigate]);

  if (loading || !isAuthenticated || !isProfileComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <Loader2 className="size-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppDataProvider>
      <div className="h-screen bg-background relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-fade-in" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-rose-500/10 dark:bg-rose-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-fade-in delay-500" />
        </div>

        <SidebarProvider
          style={
            {
              "--sidebar-width": "19rem",
            } as React.CSSProperties
          }
          className="relative z-10 h-full min-h-0"
        >
          <AppSidebar />
          <SidebarInset className="bg-transparent overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0 overflow-auto">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>

        {/* Floating Theme Toggle */}
        <FloatingThemeToggle />
      </div>
    </AppDataProvider>
  );
}
