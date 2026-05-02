import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Library,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  User,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useAppData } from "@/contexts/app-data-context";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Documents",
    icon: FileText,
    href: "/documents",
  },
  {
    title: "My Library",
    icon: Library,
    href: "/library",
  },
  {
    title: "Profile",
    icon: User,
    href: "/profile",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { chats, chatsLoading, deleteChat: deleteChatFromCtx } = useAppData();
  
  const [isExpandedHover, setIsExpandedHover] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExpanded = isExpandedHover || isDropdownOpen;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsExpandedHover(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsExpandedHover(false);
    }, 500);
  };

  // Cleanup timeout
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChatFromCtx(chatId);
      toast.success("Chat deleted");
      if (location.pathname === `/chats/${chatId}`) {
        navigate("/dashboard");
      }
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <nav 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "flex flex-col h-full bg-background py-6 overflow-hidden border-r border-transparent transition-[width,padding] duration-500 ease-[cubic-bezier(0.2,1,0.2,1)] z-50 shrink-0",
        isExpanded ? "w-72 px-5" : "w-20 px-3"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center gap-3 mb-8 transition-all duration-500", isExpanded ? "px-2" : "justify-center px-0")}>
        <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-[0.75rem] gradient-bg shadow-[0_0_15px_rgba(96,99,238,0.3)] border border-white/5">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className={cn("flex flex-col gap-0.5 leading-none transition-opacity duration-300", isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden")}>
          <span className="font-bold tracking-tight text-lg whitespace-nowrap">Adept AI</span>
          <span className="text-xs text-primary-dim uppercase tracking-[0.1em] font-medium whitespace-nowrap">
            Learning
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <div className={cn("flex-1 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col gap-8", isExpanded ? "-mx-2 px-2" : "px-0")}>
        <div className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.title}
                to={item.href}
                title={!isExpanded ? item.title : undefined}
                className={cn(
                  "flex items-center rounded-[1rem] transition-all duration-300 group relative outline-none",
                  isExpanded ? "gap-3 px-3 py-2.5" : "justify-center p-3",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-surface-container-highest/60 backdrop-blur-xl border border-white/5 rounded-[1rem] -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                <span className={cn("whitespace-nowrap transition-opacity duration-300", isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden hidden")}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Chats Section */}
        <div className="flex flex-col gap-2">
          {isExpanded ? (
            <h3 className="px-3 label-md mb-2 whitespace-nowrap opacity-100 transition-opacity duration-300">Chats</h3>
          ) : (
            <div className="h-px bg-white/5 w-8 mx-auto my-2" />
          )}
          
          <div className="flex flex-col gap-1">
            <AnimatePresence>
              {chatsLoading ? (
                <div className={cn("py-2", isExpanded ? "px-3" : "flex justify-center")}>
                  {isExpanded ? (
                     <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-primary to-secondary w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" />
                     </div>
                  ) : (
                     <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              ) : chats.length === 0 ? (
                isExpanded ? (
                   <p className="px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">
                     No chats yet
                   </p>
                ) : null
              ) : (
                chats.map((chat) => {
                  const isActive = location.pathname === `/chats/${chat._id}`;
                  return (
                    <motion.div
                      key={chat._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group flex items-center justify-between rounded-[0.75rem] relative"
                    >
                      <Link
                        to={`/chats/${chat._id}`}
                        title={!isExpanded ? chat.title : undefined}
                        className={cn(
                          "flex-1 flex items-center rounded-[0.75rem] transition-all duration-300 outline-none",
                          isExpanded ? "gap-3 px-3 py-2" : "justify-center p-3",
                          isActive
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface-container-low"
                        )}
                      >
                         {isActive && (
                          <motion.div
                            layoutId="activeChatIndicator"
                            className="absolute inset-0 bg-surface-container-highest/40 backdrop-blur-md rounded-[0.75rem] border border-white/5 -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <span className={cn("truncate text-sm transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 w-0 hidden")}>
                          {chat.title}
                        </span>
                      </Link>

                      {isExpanded && (
                        <DropdownMenu onOpenChange={setIsDropdownOpen}>
                          <DropdownMenuTrigger asChild>
                            <button className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 hover:bg-surface-container-highest rounded-md transition-all text-muted-foreground outline-none shrink-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start" className="bg-surface-container-highest/80 backdrop-blur-xl border border-white/5">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={(e) => handleDeleteChat(chat._id, e)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer Profile */}
      <div className="mt-auto pt-4 border-t border-transparent">
        <DropdownMenu onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center rounded-[1rem] hover:bg-surface-container-low transition-all duration-300 outline-none text-left border border-transparent hover:border-white/5 w-full",
              isExpanded ? "gap-3 p-2" : "justify-center p-2"
            )}>
              <Avatar className="size-10 shrink-0 shadow-[0_0_15px_rgba(96,99,238,0.1)] border border-white/5">
                <AvatarFallback className="gradient-bg text-sm font-bold">
                  {getInitials(profile?.full_name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className={cn("flex-1 min-w-0 flex flex-col transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0 w-0 hidden")}>
                <span className="truncate font-semibold text-sm">
                  {profile?.full_name || "User"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-xl bg-surface-container-highest/80 backdrop-blur-xl border border-white/5"
            side={isExpanded ? "top" : "right"}
            align={isExpanded ? "start" : "end"}
            sideOffset={12}
          >
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer py-2">
                <User className="mr-2 size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer py-2"
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}