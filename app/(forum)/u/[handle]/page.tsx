"use client";

import { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TopicList } from "@/components/forum/topic-list";
import {
  getProfileByHandle,
  getUserTopics,
  getUserComments,
  getUserBadges,
  getUserRoles,
  type Comment,
  type Badge as BadgeType,
  type Role,
} from "@/lib/api";
import { useAuth, getRoleColor, ROLE_IDS } from "@/lib/auth-context";
import { formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Star,
  MessageSquare,
  FileText,
  Settings,
  Award,
  Shield,
  Crown,
  Users,
  Code,
  HelpCircle,
} from "lucide-react";

interface UserPageProps {
  params: Promise<{ handle: string }>;
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <Link
      href={`/t/${comment.topic_id}`}
      className="block rounded-lg border border-border bg-card p-4 hover:border-muted-foreground/30 transition-colors"
    >
      <p className="text-sm text-foreground line-clamp-2">{comment.body}</p>
      <p className="text-xs text-muted-foreground mt-2">
        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
      </p>
    </Link>
  );
}

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

// Badge item with tooltip
function BadgeItem({ badge }: { badge: BadgeType }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-secondary border border-border cursor-default hover:bg-secondary/80 transition-colors">
          {badge.icon_url ? (
            <img src={badge.icon_url} alt="" className="h-4 w-4" />
          ) : (
            <Award className="h-4 w-4 text-amber-400" />
          )}
          <span className="text-sm">{badge.name}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium">{badge.name}</p>
        {badge.description && (
          <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

// Role item with tooltip
function RoleItem({ role }: { role: Role }) {
  const colorClasses = getRoleColor(role.id);
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full border cursor-default transition-colors ${colorClasses}`}>
          <RoleIcon roleId={role.id} className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">{role.name}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium">{role.name}</p>
        {role.description && (
          <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export default function UserPage({ params }: UserPageProps) {
  const { handle } = use(params);
  const { profile: currentProfile } = useAuth();
  const isOwnProfile = currentProfile?.handle === handle;

  const { data: profile, isLoading: loadingProfile } = useSWR(
    ["profile", handle],
    () => getProfileByHandle(handle)
  );

  const { data: topics, isLoading: loadingTopics } = useSWR(
    profile ? ["user-topics", profile.id] : null,
    () => getUserTopics(profile!.id)
  );

  const { data: comments, isLoading: loadingComments } = useSWR(
    profile ? ["user-comments", profile.id] : null,
    () => getUserComments(profile!.id)
  );

  const { data: badges } = useSWR(
    profile ? ["user-badges", profile.id] : null,
    () => getUserBadges(profile!.id)
  );

  const { data: roles } = useSWR(
    profile ? ["user-roles", profile.id] : null,
    () => getUserRoles(profile!.id)
  );

  if (loadingProfile) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-7 w-48 bg-muted animate-pulse rounded" />
              <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              <div className="h-16 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">User not found</h1>
        <p className="text-muted-foreground mb-4">
          The user @{handle} doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const typedRoles = roles as Role[] | undefined;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 shrink-0">
              <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
              <AvatarFallback className="text-3xl">
                {profile.display_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                <span className="text-muted-foreground">@{profile.handle}</span>
              </div>
              
              {/* Roles */}
              {typedRoles && typedRoles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {typedRoles.map((role) => (
                    <RoleItem key={role.id} role={role} />
                  ))}
                </div>
              )}

              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {profile.reputation || 0} reputation
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {topics?.length || 0} topics
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {comments?.length || 0} comments
                </span>
              </div>
            </div>
            {isOwnProfile && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-1" />
                  Edit Profile
                </Link>
              </Button>
            )}
          </div>

          {/* Badges */}
          {badges && badges.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <BadgeItem key={badge.id} badge={badge} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Tabs */}
        <Tabs defaultValue="topics">
          <TabsList>
            <TabsTrigger value="topics" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="mt-4">
            <TopicList
              topics={topics}
              isLoading={loadingTopics}
              emptyMessage={`${profile.display_name} hasn't created any topics yet.`}
            />
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            {loadingComments ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {profile.display_name} hasn&apos;t posted any comments yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
