"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, ROLE_IDS, ROLE_HIERARCHY } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  Award,
  Shield,
  Settings,
  MessageSquare,
  FileText,
  Tag,
  Folder,
  Bell,
  ChevronLeft,
  Crown,
  Star,
  Code,
  HelpCircle,
  Megaphone,
} from "lucide-react";

// Navigation items based on permission levels
const getNavItems = (permissionLevel: number) => {
  const items = [];

  // Everyone with any role
  items.push({
    label: "Dashboard",
    href: "/panel",
    icon: LayoutDashboard,
    minLevel: 0,
  });

  // Assistants+ (50+)
  if (permissionLevel >= 50) {
    items.push({
      label: "Reports",
      href: "/panel/reports",
      icon: Bell,
      minLevel: 50,
    });
  }

  // Moderators+ (60+)
  if (permissionLevel >= 60) {
    items.push({
      label: "Content Moderation",
      href: "/panel/moderation",
      icon: FileText,
      minLevel: 60,
    });
  }

  // Developers+ (70+)
  if (permissionLevel >= 70) {
    items.push({
      label: "Categories",
      href: "/panel/categories",
      icon: Folder,
      minLevel: 70,
    });
    items.push({
      label: "Tags",
      href: "/panel/tags",
      icon: Tag,
      minLevel: 70,
    });
  }

  // Management+ (80+)
  if (permissionLevel >= 80) {
    items.push({
      label: "Users",
      href: "/panel/users",
      icon: Users,
      minLevel: 80,
    });
    items.push({
      label: "Badges",
      href: "/panel/badges",
      icon: Award,
      minLevel: 80,
    });
    items.push({
      label: "Roles",
      href: "/panel/roles",
      icon: Shield,
      minLevel: 80,
    });
  }

  // Directors+ (90+)
  if (permissionLevel >= 90) {
    items.push({
      label: "Announcements",
      href: "/panel/announcements",
      icon: Megaphone,
      minLevel: 90,
    });
  }

  // Owner only (100)
  if (permissionLevel >= 100) {
    items.push({
      label: "Site Settings",
      href: "/panel/settings",
      icon: Settings,
      minLevel: 100,
    });
  }

  return items;
};

// Role icon component
function RoleIcon({ roleId, className }: { roleId: string; className?: string }) {
  switch (roleId) {
    case ROLE_IDS.OWNER:
      return <Crown className={className} />;
    case ROLE_IDS.FORUM_DIRECTOR:
      return <Star className={className} />;
    case ROLE_IDS.MANAGEMENT_TEAM:
      return <Users className={className} />;
    case ROLE_IDS.DEVELOPER:
      return <Code className={className} />;
    case ROLE_IDS.FORUM_MODERATOR:
      return <Shield className={className} />;
    case ROLE_IDS.ASSISTANT:
      return <HelpCircle className={className} />;
    default:
      return <Shield className={className} />;
  }
}

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, profile, roles, canAccessPanel, getHighestRole } = useAuth();

  // Calculate permission level
  const permissionLevel = roles.reduce((max, role) => {
    const level = ROLE_HIERARCHY[role.id] || 0;
    return level > max ? level : max;
  }, 0);

  const navItems = getNavItems(permissionLevel);
  const highestRole = getHighestRole();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !canAccessPanel())) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, canAccessPanel, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !canAccessPanel()) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Back to Forum</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="font-semibold">Staff Panel</h1>
              <p className="text-xs text-muted-foreground">Administration</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <item.icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url} alt={profile?.display_name || ""} />
              <AvatarFallback>
                {profile?.display_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.display_name}</p>
              {highestRole && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <RoleIcon roleId={highestRole.id} className="h-3 w-3" />
                  <span className="truncate">{highestRole.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
