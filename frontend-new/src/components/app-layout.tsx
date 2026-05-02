import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { AppDataProvider } from "@/contexts/app-data-context";
import { AppSidebar } from "./app-sidebar";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const isChat = currentPageTitle === "Chat";

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
      <div className="flex h-screen w-full bg-background relative overflow-hidden text-foreground font-sans">
        {/* Ambient Depth Backgrounds */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary-dim/5 blur-[120px] rounded-full mix-blend-screen animate-fade-in" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[120px] rounded-full mix-blend-screen animate-fade-in delay-500" />
        </div>

        <div className="relative z-10 flex h-full w-full">
          <AppSidebar />
          <main className={cn("flex-1 flex flex-col min-w-0 bg-surface-container-low/50 backdrop-blur-xl rounded-l-[1.5rem] border-l border-white/5 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] overflow-hidden", isChat ? "my-2 mr-2" : "my-4 mr-4")}>
            <div className={cn("flex-1 overflow-hidden flex flex-col", !isChat && "p-6 overflow-auto")}>
              <div className={cn("h-full w-full flex flex-col", !isChat && "max-w-[1200px] mx-auto")}>
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </AppDataProvider>
  );
}
