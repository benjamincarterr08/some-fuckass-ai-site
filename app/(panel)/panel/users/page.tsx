"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getUsers,
  getProfiles,
  getUserRoles,
  getUserBadges,
  getRoles,
  getBadges,
  assignUserRole,
  removeUserRole,
  assignUserBadge,
  removeUserBadge,
  type Profile,
  type Role,
  type Badge as BadgeType,
} from "@/lib/api";
import { useAuth, getRoleColor, ROLE_IDS, ROLE_HIERARCHY } from "@/lib/auth-context";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  Search,
  MoreVertical,
  ExternalLink,
  Shield,
  Award,
  Loader2,
  Crown,
  Star,
  Code,
  HelpCircle,
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

function ManageUserDialog({
  profile,
  open,
  onClose,
}: {
  profile: Profile;
  open: boolean;
  onClose: () => void;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedBadgeId, setSelectedBadgeId] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: userRoles, isLoading: loadingRoles } = useSWR(
    open ? ["user-roles", profile.id] : null,
    () => getUserRoles(profile.id)
  );

  const { data: userBadges, isLoading: loadingBadges } = useSWR(
    open ? ["user-badges", profile.id] : null,
    () => getUserBadges(profile.id)
  );

  const { data: allRoles } = useSWR(open ? "all-roles" : null, getRoles);
  const { data: allBadges } = useSWR(open ? "all-badges" : null, getBadges);

  const handleAddRole = async () => {
    if (!selectedRoleId) return;
    setLoading(true);
    try {
      await assignUserRole(profile.id, selectedRoleId);
      mutate(["user-roles", profile.id]);
      setSelectedRoleId("");
      toast.success("Role assigned");
    } catch (error) {
      toast.error("Failed to assign role");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    setLoading(true);
    try {
      await removeUserRole(profile.id, roleId);
      mutate(["user-roles", profile.id]);
      toast.success("Role removed");
    } catch (error) {
      toast.error("Failed to remove role");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBadge = async () => {
    if (!selectedBadgeId) return;
    setLoading(true);
    try {
      await assignUserBadge(profile.id, selectedBadgeId);
      mutate(["user-badges", profile.id]);
      setSelectedBadgeId("");
      toast.success("Badge awarded");
    } catch (error) {
      toast.error("Failed to award badge");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBadge = async (badgeId: string) => {
    setLoading(true);
    try {
      await removeUserBadge(profile.id, badgeId);
      mutate(["user-badges", profile.id]);
      toast.success("Badge removed");
    } catch (error) {
      toast.error("Failed to remove badge");
    } finally {
      setLoading(false);
    }
  };

  const typedUserRoles = userRoles as Role[] | undefined;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage User</DialogTitle>
          <DialogDescription>
            Manage roles and badges for {profile.display_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>{profile.display_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{profile.display_name}</p>
              <p className="text-sm text-muted-foreground">@{profile.handle}</p>
            </div>
          </div>

          {/* Roles Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </h4>
            {loadingRoles ? (
              <div className="h-10 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {typedUserRoles && typedUserRoles.length > 0 ? (
                    typedUserRoles.map((role) => {
                      const colorClasses = getRoleColor(role.id);
                      return (
                        <div
                          key={role.id}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-sm ${colorClasses}`}
                        >
                          <RoleIcon roleId={role.id} className="h-3.5 w-3.5" />
                          {role.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(role.id)}
                            className="ml-1 hover:text-destructive"
                            disabled={loading}
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No roles assigned</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {allRoles?.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddRole} disabled={loading || !selectedRoleId}>
                    Add
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Badges Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Badges
            </h4>
            {loadingBadges ? (
              <div className="h-10 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {userBadges && userBadges.length > 0 ? (
                    userBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary border border-border text-sm"
                      >
                        {badge.icon_url ? (
                          <img src={badge.icon_url} alt="" className="h-3.5 w-3.5" />
                        ) : (
                          <Award className="h-3.5 w-3.5" />
                        )}
                        {badge.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveBadge(badge.id)}
                          className="ml-1 hover:text-destructive"
                          disabled={loading}
                        >
                          &times;
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No badges awarded</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Select value={selectedBadgeId} onValueChange={setSelectedBadgeId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select badge" />
                    </SelectTrigger>
                    <SelectContent>
                      {allBadges?.map((badge) => (
                        <SelectItem key={badge.id} value={badge.id}>
                          {badge.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddBadge} disabled={loading || !selectedBadgeId}>
                    Add
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const { data: profiles, isLoading } = useSWR(
    searchQuery.length >= 2 ? ["profiles-search", searchQuery] : "profiles",
    () => (searchQuery.length >= 2 ? getProfiles(searchQuery) : getProfiles())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1">
          View and manage forum users
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users</CardTitle>
          <CardDescription>
            {profiles?.length || 0} user{profiles?.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : profiles && profiles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Reputation</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback>
                            {profile.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile.display_name}</p>
                          <p className="text-sm text-muted-foreground">
                            @{profile.handle}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {profile.reputation || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/u/${profile.handle}`} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSelectedUser(profile)}>
                            <Shield className="h-4 w-4 mr-2" />
                            Manage Roles & Badges
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage User Dialog */}
      {selectedUser && (
        <ManageUserDialog
          profile={selectedUser}
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
