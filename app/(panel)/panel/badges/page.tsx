"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  getBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  type Badge,
} from "@/lib/api";
import { toast } from "sonner";
import { Award, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

function BadgeForm({
  badge,
  onSubmit,
  onCancel,
}: {
  badge?: Badge;
  onSubmit: (data: { name: string; description: string; icon_url: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(badge?.name || "");
  const [description, setDescription] = useState(badge?.description || "");
  const [iconUrl, setIconUrl] = useState(badge?.icon_url || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, description, icon_url: iconUrl });
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
          placeholder="Badge name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Badge description"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon_url">Icon URL</Label>
        <Input
          id="icon_url"
          value={iconUrl}
          onChange={(e) => setIconUrl(e.target.value)}
          placeholder="/badges/icon.png"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {badge ? "Update" : "Create"} Badge
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function BadgesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editBadge, setEditBadge] = useState<Badge | null>(null);

  const { data: badges, isLoading } = useSWR("badges", getBadges);

  const handleCreateBadge = async (data: { name: string; description: string; icon_url: string }) => {
    try {
      await createBadge(data);
      mutate("badges");
      setCreateDialogOpen(false);
      toast.success("Badge created successfully");
    } catch (error) {
      toast.error("Failed to create badge");
    }
  };

  const handleUpdateBadge = async (data: { name: string; description: string; icon_url: string }) => {
    if (!editBadge) return;
    try {
      await updateBadge(editBadge.id, data);
      mutate("badges");
      setEditBadge(null);
      toast.success("Badge updated successfully");
    } catch (error) {
      toast.error("Failed to update badge");
    }
  };

  const handleDeleteBadge = async (badge: Badge) => {
    try {
      await deleteBadge(badge.id);
      mutate("badges");
      toast.success("Badge deleted successfully");
    } catch (error) {
      toast.error("Failed to delete badge");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Badges</h1>
          <p className="text-muted-foreground mt-1">
            Manage forum badges and achievements
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Badge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Badge</DialogTitle>
              <DialogDescription>
                Create a new badge that can be awarded to users.
              </DialogDescription>
            </DialogHeader>
            <BadgeForm
              onSubmit={handleCreateBadge}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Badges</CardTitle>
          <CardDescription>
            {badges?.length || 0} badge{badges?.length !== 1 ? "s" : ""} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : badges && badges.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Badge</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {badges.map((badge) => (
                  <TableRow key={badge.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {badge.icon_url ? (
                          <img src={badge.icon_url} alt="" className="h-8 w-8 rounded" />
                        ) : (
                          <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                            <Award className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{badge.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {badge.description || "No description"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditBadge(badge)}
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
                              <AlertDialogTitle>Delete Badge</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the &quot;{badge.name}&quot; badge?
                                This will remove it from all users who have it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBadge(badge)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No badges created yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
              >
                Create your first badge
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editBadge} onOpenChange={(open) => !open && setEditBadge(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Badge</DialogTitle>
            <DialogDescription>
              Update the badge details.
            </DialogDescription>
          </DialogHeader>
          {editBadge && (
            <BadgeForm
              badge={editBadge}
              onSubmit={handleUpdateBadge}
              onCancel={() => setEditBadge(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
