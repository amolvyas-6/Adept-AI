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
} from "lucide-react";
import { api, type ChatListItem } from "@/lib/api";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: { email?: string; id: string } | null;
  profile: { full_name?: string } | null;
}

export function AppSidebar({ user, profile, ...props }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [chats, setChats] = React.useState<ChatListItem[]>([]);
  const [chatsLoading, setChatsLoading] = React.useState(true);

  React.useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const data = await api.getChats();
      setChats(data);
    } catch {
      // silently fail — user may not have chats yet
    } finally {
      setChatsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      toast.success("Chat deleted");
      // If currently viewing the deleted chat, navigate away
      if (location.pathname === `/chats/${chatId}`) {
        navigate("/dashboard");
      }
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  const handleLogout = async () => {
    const { error } = await api.logout();
    if (error) {
      toast.error("Failed to log out");
    } else {
      toast.success("Logged out successfully");
      navigate("/auth");
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
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="bg-indigo-500 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                  <BookOpen className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Adept AI</span>
                  <span className="text-xs text-muted-foreground">
                    Learning Platform
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link to={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {chatsLoading ? (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">
                Loading...
              </p>
            ) : chats.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">
                No chats yet
              </p>
            ) : (
              chats.map((chat) => {
                const isActive = location.pathname === `/chats/${chat._id}`;
                return (
                  <SidebarMenuItem key={chat._id}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={`/chats/${chat._id}`}>
                        <MessageSquare className="size-4" />
                        <span className="truncate">{chat.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreHorizontal className="size-4" />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={(e) => handleDeleteChat(chat._id, e)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                );
              })
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                      {getInitials(profile?.full_name, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {profile?.full_name || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
