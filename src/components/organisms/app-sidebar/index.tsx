"use client";

import * as React from "react";
import {
  Settings2,
  Zap,
  Home,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  User,
  Lightbulb,
  Bot,
  Calendar,
  Clock,
  Package,
  Sparkles,
  Library,
  Lock,
  Share2,
  TrendingUp,
  BarChart3,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/organisms/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/molecules/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/atoms/collapsible";

import { useAuthStore } from "@/stores/auth-store";
import { useUsers } from "@/hooks/api/use-users";
import { useAsset } from "@/hooks/assets";
import { useRouter } from "next/navigation";
import { useOnboardingStatus } from "@/hooks/use-onboarding-status";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    items: [],
    iconClassName: "text-primary",
    minFilesRequired: 0,
  },
  {
    title: "Generate",
    url: "/create",
    icon: Sparkles,
    items: [],
    iconClassName: "text-primary",
    minFilesRequired: 10,
  },
  {
    title: "Library",
    url: "/library",
    icon: Library,
    items: [],
    iconClassName: "text-primary",
    minFilesRequired: 10,
  },
  {
    title: "Repurpose Engine",
    url: "/auto-clone",
    icon: Bot,
    items: [],
    iconClassName: "text-primary",
    minFilesRequired: 0,
  },
  {
    title: "Knowledge Base",
    url: "/knowledge-base",
    icon: Lightbulb,
    items: [],
    iconClassName: "text-primary",
    minFilesRequired: 0,
  },
  {
    title: "Compare",
    url: "/compare",
    icon: Zap,
    items: [],
    iconClassName: "text-primary",
    minFilesRequired: 10,
    badge: "New",
  },
  {
    title: "Showcase",
    url: "/showcase",
    icon: BarChart3,
    items: [],
    iconClassName: "text-primary",
    minFilesRequired: 10,
  },
  {
    title: "Evolution",
    url: "/evolution",
    icon: TrendingUp,
    items: [],
    iconClassName: "text-primary",
    minFilesRequired: 25,
  },
  {
    title: "Share",
    url: "/share",
    icon: Share2,
    items: [],
    iconClassName: "text-primary",
    minFilesRequired: 10,
  },
  {
    title: "Schedule",
    url: "/schedule",
    icon: Calendar,
    items: [],
    iconClassName: "text-primary",
    comingSoon: true,
    minFilesRequired: 25,
  },
];

function ControlCenter() {
  const { isMobile } = useSidebar();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { getCurrentUser, isLoading: isUserLoading } = useUsers();

  React.useEffect(() => {
    if (isAuthenticated && (!user?.firstName || !user?.lastName)) {
      getCurrentUser();
    }
  }, [isAuthenticated, user?.firstName, user?.lastName, getCurrentUser]);

  const getUserDisplayName = React.useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user?.lastName}`;
    }
    if (user?.username) {
      return user.username;
    }
    return user?.email || "User";
  }, [user?.firstName, user?.lastName, user?.username, user?.email]);

  const getUserInitials = React.useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  }, [user?.firstName, user?.lastName, user?.username, user?.email]);

  const getOrganizationName = React.useMemo(() => {
    if (user?.portfolioId) {
      return "Portfolio";
    }
    return "Personal Account";
  }, [user?.portfolioId]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-gray-100 text-primary flex aspect-square size-6 items-center justify-center rounded-sm border border-primary">
                {user?.media?.images?.avatar ? (
                  <Avatar className="h-6 w-6 rounded-sm">
                    <AvatarImage
                      src={user.media.images.avatar}
                      alt={getUserDisplayName}
                    />
                    <AvatarFallback className="rounded-sm text-xs font-medium">
                      {getUserInitials}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="size-4 text-primary" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {isUserLoading ? "Loading..." : getUserDisplayName}
                </span>
                <span className="truncate text-xs">{getOrganizationName}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-xs rounded-xl p-2"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <div className="flex flex-col py-3">
              <div className="flex flex-col items-center py-3">
                {user?.media?.images?.avatar ? (
                  <Avatar className="h-16 w-16 rounded-lg mb-3 border-2 border-primary">
                    <AvatarImage
                      src={user.media.images.avatar}
                      alt={getUserDisplayName}
                    />
                    <AvatarFallback className="rounded-lg text-lg font-medium text-primary">
                      {getUserInitials}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-16 w-16 rounded-lg mb-3 border-2 border-primary">
                    <AvatarFallback className="rounded-lg text-lg font-medium text-primary">
                      {getUserInitials}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="font-medium text-base text-gray-900 leading-tight text-center mb-1">
                  {isUserLoading ? "Loading..." : getUserDisplayName}
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  {user?.email}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            <div className="py-1">
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <span className="mr-3">
                    <Settings2 className="w-5 h-5" />
                  </span>
                  <span className="flex-1">Settings</span>
                </Link>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <div className="py-1">
              <DropdownMenuItem onClick={logout}>
                <span className="mr-3">
                  <LogOut className="w-5 h-5" />
                </span>
                <span className="flex-1">Sign out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ElementType;
    iconClassName?: string;
    isActive?: boolean;
    comingSoon?: boolean;
    minFilesRequired?: number;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { fileCount } = useOnboardingStatus();
  const {
    handleOpenCreateModal,
    handleOpenBulkCreateModal,
    handleBlankAssetCreate,
  } = useAsset();

  const handleSubItemClick = (href: string, label: string) => {
    router.push(href);

    if (label === "Bulk Create") {
      handleOpenBulkCreateModal();
    } else if (label === "Create") {
      handleOpenCreateModal();
    } else if (label === "Blank Create") {
      handleBlankAssetCreate();
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.url || pathname.startsWith(item.url + "/");
          const isLocked = fileCount < (item.minFilesRequired || 0);
          const isDisabled = item.comingSoon || isLocked;

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={
                      isLocked
                        ? `Upload ${(item.minFilesRequired || 0) - fileCount} more files to unlock`
                        : item.title
                    }
                    isActive={isActive && !isDisabled}
                    asChild={
                      (!item.items || item.items.length === 0) && !isDisabled
                    }
                    className={cn(
                      isDisabled && "opacity-60 cursor-not-allowed"
                    )}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  >
                    {!item.items || item.items.length === 0 ? (
                      isDisabled ? (
                        <div className="flex items-center w-full">
                          <div className="relative">
                            {Icon && (
                              <Icon
                                className={cn(
                                  item.iconClassName,
                                  isLocked && "text-[#9b8baf]"
                                )}
                              />
                            )}
                            {isLocked && (
                              <Lock
                                className="absolute -top-1 -right-1 h-3 w-3 text-[#9b8baf]"
                                aria-label="Locked"
                              />
                            )}
                          </div>
                          <span
                            className={cn(isLocked && "text-[#9b8baf] ml-2")}
                          >
                            {item.title}
                          </span>
                          <div className="ml-auto flex items-center gap-2">
                            {item.comingSoon && (
                              <>
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  Coming Soon
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Link href={item.url}>
                          {Icon && <Icon className={item.iconClassName} />}
                          <span>{item.title}</span>
                        </Link>
                      )
                    ) : (
                      <>
                        <div className="relative">
                          {Icon && (
                            <Icon
                              className={cn(
                                item.iconClassName,
                                isLocked && "text-[#9b8baf]"
                              )}
                            />
                          )}
                          {isLocked && (
                            <Lock
                              className="absolute -top-1 -right-1 h-3 w-3 text-[#9b8baf]"
                              aria-label="Locked"
                            />
                          )}
                        </div>
                        <span className={cn(isLocked && "text-[#9b8baf]")}>
                          {item.title}
                        </span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {item.items && item.items.length > 0 && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            onClick={(e) => {
                              e.preventDefault();
                              handleSubItemClick(subItem.url, subItem.title);
                            }}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ControlCenter />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
