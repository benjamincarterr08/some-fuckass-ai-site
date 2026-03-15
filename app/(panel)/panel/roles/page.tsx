"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getUserRolesAll,
  assignUserRole,
  removeUserRole,
  getProfiles,
  type Role,
  type UserRole,
  type Profile,
} from "@/lib/api";
import { useAuth, getRoleColor, ROLE_IDS, ROLE_HIERARCHY } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  UserPlus,
  Crown,
  Star,
  Users,
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

function RoleForm({
  role,
  onSubmit,
  onCancel,
}: {
  role?: Role;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(role?.name || "");
  const [description, setDescription] = useState(role?.description || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, description });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Role name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Role description"
          rows={3}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {role ? "Update" : "Create"} Role
        </Button>
      </DialogFooter>
    </form>
  );
}

function AssignRoleDialog({
  roles,
  onAssign,
}: {
  roles: Role[];
  onAssign: (userId: string, roleId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: profiles } = useSWR(
    open && searchQuery.length >= 2 ? ["profiles-search", searchQuery] : null,
    () => getProfiles(searchQuery)
  );

  const handleAssign = async () => {
    if (!selectedUserId || !selectedRoleId) return;
    setLoading(true);
    try {
      await onAssign(selectedUserId, selectedRoleId);
      setOpen(false);
      setSearchQuery("");
      setSelectedUserId("");
      setSelectedRoleId("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Role to User</DialogTitle>
          <DialogDescription>
            Search for a user and select a role to assign.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-search">Search User</Label>
            <Input
              id="user-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or handle..."
            />
            {profiles && profiles.length > 0 && (
              <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setSelectedUserId(profile.id)}
                    className={`w-full flex items-center gap-3 p-2 hover:bg-secondary transition-colors ${
                      selectedUserId === profile.id ? "bg-secondary" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>{profile.display_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{profile.display_name}</p>
                      <p className="text-xs text-muted-foreground">@{profile.handle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-select">Select Role</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <RoleIcon roleId={role.id} className="h-4 w-4" />
                      {role.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading || !selectedUserId || !selectedRoleId}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assign Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function RolesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);

  const { roles: myRoles } = useAuth();
  const myPermissionLevel = myRoles.reduce((max, role) => {
    const level = ROLE_HIERARCHY[role.id] || 0;
    return level > max ? level : max;
  }, 0);

  const { data: roles, isLoading } = useSWR("roles", getRoles);
  const { data: userRoles } = useSWR("user-roles-all", getUserRolesAll);

  const handleCreateRole = async (data: { name: string; description: string }) => {
    try {
      await createRole(data);
      mutate("roles");
      setCreateDialogOpen(false);
      toast.success("Role created successfully");
    } catch (error) {
      toast.error("Failed to create role");
    }
  };

  const handleUpdateRole = async (data: { name: string; description: string }) => {
    if (!editRole) return;
    try {
      await updateRole(editRole.id, data);
      mutate("roles");
      setEditRole(null);
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      await deleteRole(role.id);
      mutate("roles");
      toast.success("Role deleted successfully");
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      await assignUserRole(userId, roleId);
      mutate("user-roles-all");
      toast.success("Role assigned successfully");
    } catch (error) {
      toast.error("Failed to assign role");
    }
  };

  const handleRemoveUserRole = async (userId: string, roleId: string) => {
    try {
      await removeUserRole(userId, roleId);
      mutate("user-roles-all");
      toast.success("Role removed successfully");
    } catch (error) {
      toast.error("Failed to remove role");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground mt-1">
            Manage staff roles and assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          {roles && <AssignRoleDialog roles={roles} onAssign={handleAssignRole} />}
          {myPermissionLevel >= 100 && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Role</DialogTitle>
                  <DialogDescription>
                    Create a new staff role.
                  </DialogDescription>
                </DialogHeader>
                <RoleForm
                  onSubmit={handleCreateRole}
                  onCancel={() => setCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Roles List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Roles</CardTitle>
          <CardDescription>
            {roles?.length || 0} role{roles?.length !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : roles && roles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Level</TableHead>
                  {myPermissionLevel >= 100 && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => {
                  const colorClasses = getRoleColor(role.id);
                  const level = ROLE_HIERARCHY[role.id] || 0;
                  return (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border ${colorClasses}`}>
                          <RoleIcon roleId={role.id} className="h-4 w-4" />
                          <span className="font-medium">{role.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-md">
                        {role.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{level}</span>
                      </TableCell>
                      {myPermissionLevel >= 100 && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditRole(role)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the &quot;{role.name}&quot; role?
                                    This will remove it from all users.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteRole(role)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No roles configured</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editRole} onOpenChange={(open) => !open && setEditRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role details.
            </DialogDescription>
          </DialogHeader>
          {editRole && (
            <RoleForm
              role={editRole}
              onSubmit={handleUpdateRole}
              onCancel={() => setEditRole(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
