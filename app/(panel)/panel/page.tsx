"use client";

import useSWR from "swr";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, ROLE_IDS, ROLE_HIERARCHY, getRoleColor } from "@/lib/auth-context";
import {
  getUsers,
  getTopics,
  getCategories,
  getBadges,
  getRoles,
  getSiteSettings,
} from "@/lib/api";
import {
  Users,
  FileText,
  Folder,
  Award,
  Shield,
  TrendingUp,
  Activity,
  Settings,
  Crown,
  Star,
  Code,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

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

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  loading,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  loading?: boolean;
}) {
  const content = (
    <Card className={href ? "hover:border-muted-foreground/30 transition-colors cursor-pointer" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function PanelDashboard() {
  const { profile, roles } = useAuth();
  
  // Calculate permission level
  const permissionLevel = roles.reduce((max, role) => {
    const level = ROLE_HIERARCHY[role.id] || 0;
    return level > max ? level : max;
  }, 0);

  const { data: usersData, isLoading: loadingUsers } = useSWR(
    permissionLevel >= 80 ? "users" : null,
    () => getUsers({ pageSize: 1 })
  );

  const { data: topicsData, isLoading: loadingTopics } = useSWR(
    "topics",
    () => getTopics({ pageSize: 1 })
  );

  const { data: categories, isLoading: loadingCategories } = useSWR(
    "categories",
    getCategories
  );

  const { data: badges, isLoading: loadingBadges } = useSWR(
    permissionLevel >= 80 ? "badges" : null,
    getBadges
  );

  const { data: rolesData, isLoading: loadingRoles } = useSWR(
    permissionLevel >= 80 ? "roles" : null,
    getRoles
  );

  const { data: siteSettings } = useSWR(
    permissionLevel >= 90 ? "site-settings" : null,
    getSiteSettings
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {profile?.display_name}. Here&apos;s an overview of the forum.
        </p>
      </div>

      {/* Maintenance Mode Warning */}
      {siteSettings?.maintenance_mode && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="font-medium text-amber-500">Maintenance Mode Active</p>
              <p className="text-sm text-muted-foreground">
                The forum is currently in maintenance mode. Only staff can access it.
              </p>
            </div>
            {permissionLevel >= 100 && (
              <Button variant="outline" size="sm" className="ml-auto" asChild>
                <Link href="/panel/settings">Manage</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Your Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Roles</CardTitle>
          <CardDescription>Your current staff roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => {
              const colorClasses = getRoleColor(role.id);
              return (
                <div
                  key={role.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClasses}`}
                >
                  <RoleIcon roleId={role.id} className="h-4 w-4" />
                  <span className="text-sm font-medium">{role.name}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {permissionLevel >= 80 && (
          <StatCard
            title="Total Users"
            value={usersData?.page ? "..." : "Loading"}
            icon={Users}
            href="/panel/users"
            loading={loadingUsers}
          />
        )}
        <StatCard
          title="Topics"
          value={topicsData?.page ? "..." : "Loading"}
          icon={FileText}
          loading={loadingTopics}
        />
        <StatCard
          title="Categories"
          value={categories?.length || 0}
          icon={Folder}
          href={permissionLevel >= 70 ? "/panel/categories" : undefined}
          loading={loadingCategories}
        />
        {permissionLevel >= 80 && (
          <>
            <StatCard
              title="Badges"
              value={badges?.length || 0}
              icon={Award}
              href="/panel/badges"
              loading={loadingBadges}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks based on your permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {permissionLevel >= 60 && (
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link href="/panel/moderation">
                  <FileText className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Review Content</div>
                    <div className="text-xs text-muted-foreground">Moderate topics and comments</div>
                  </div>
                </Link>
              </Button>
            )}
            {permissionLevel >= 70 && (
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link href="/panel/categories">
                  <Folder className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Manage Categories</div>
                    <div className="text-xs text-muted-foreground">Edit forum categories</div>
                  </div>
                </Link>
              </Button>
            )}
            {permissionLevel >= 80 && (
              <>
                <Button variant="outline" className="justify-start h-auto py-3" asChild>
                  <Link href="/panel/users">
                    <Users className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Manage Users</div>
                      <div className="text-xs text-muted-foreground">View and edit user accounts</div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-3" asChild>
                  <Link href="/panel/badges">
                    <Award className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Manage Badges</div>
                      <div className="text-xs text-muted-foreground">Create and assign badges</div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-3" asChild>
                  <Link href="/panel/roles">
                    <Shield className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Manage Roles</div>
                      <div className="text-xs text-muted-foreground">Assign staff roles</div>
                    </div>
                  </Link>
                </Button>
              </>
            )}
            {permissionLevel >= 100 && (
              <Button variant="outline" className="justify-start h-auto py-3" asChild>
                <Link href="/panel/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Site Settings</div>
                    <div className="text-xs text-muted-foreground">Configure forum settings</div>
                  </div>
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permission Level Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Access Level</CardTitle>
          <CardDescription>Your current permission level in the staff hierarchy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Permission Level</span>
              <span className="font-mono text-sm">{permissionLevel}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${permissionLevel}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Assistant (50)</span>
              <span>Owner (100)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
