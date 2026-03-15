"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  getTags,
  getCategories,
  createTag,
  updateTag,
  deleteTag,
  type Tag,
  type Category,
} from "@/lib/api";
import { toast } from "sonner";
import { Tag as TagIcon, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

function TagForm({
  tag,
  categories,
  onSubmit,
  onCancel,
}: {
  tag?: Tag;
  categories: Category[];
  onSubmit: (data: { name: string; category_id?: string | null }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(tag?.name || "");
  const [categoryId, setCategoryId] = useState(tag?.category_id || "global");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        category_id: categoryId === "global" ? null : categoryId,
      });
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
          placeholder="tag-name"
          required
        />
        <p className="text-xs text-muted-foreground">
          Tags are typically lowercase with hyphens (e.g., bug-report, feature-request)
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category (optional)</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">Global (all categories)</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Leave as global to allow this tag in all categories
        </p>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {tag ? "Update" : "Create"} Tag
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function TagsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);

  const { data: tags, isLoading } = useSWR("tags", () => getTags());
  const { data: categories } = useSWR("categories", getCategories);

  const handleCreateTag = async (data: { name: string; category_id?: string | null }) => {
    try {
      await createTag(data);
      mutate("tags");
      setCreateDialogOpen(false);
      toast.success("Tag created successfully");
    } catch (error) {
      toast.error("Failed to create tag");
    }
  };

  const handleUpdateTag = async (data: { name: string; category_id?: string | null }) => {
    if (!editTag) return;
    try {
      await updateTag(editTag.id, data);
      mutate("tags");
      setEditTag(null);
      toast.success("Tag updated successfully");
    } catch (error) {
      toast.error("Failed to update tag");
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    try {
      await deleteTag(tag.id);
      mutate("tags");
      toast.success("Tag deleted successfully");
    } catch (error) {
      toast.error("Failed to delete tag");
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Global";
    const category = categories?.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground mt-1">
            Manage topic tags
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tag</DialogTitle>
              <DialogDescription>
                Create a new tag for categorizing topics.
              </DialogDescription>
            </DialogHeader>
            <TagForm
              categories={categories || []}
              onSubmit={handleCreateTag}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Tags</CardTitle>
          <CardDescription>
            {tags?.length || 0} tag{tags?.length !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : tags && tags.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {tag.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getCategoryName(tag.category_id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditTag(tag)}
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
                              <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the &quot;{tag.name}&quot; tag?
                                It will be removed from all topics.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTag(tag)}>
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
              <TagIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tags created yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
              >
                Create your first tag
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editTag} onOpenChange={(open) => !open && setEditTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag details.
            </DialogDescription>
          </DialogHeader>
          {editTag && (
            <TagForm
              tag={editTag}
              categories={categories || []}
              onSubmit={handleUpdateTag}
              onCancel={() => setEditTag(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
