"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  getTopics,
  updateTopic,
  deleteTopic,
  type Topic,
} from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  MoreVertical,
  ExternalLink,
  Lock,
  Unlock,
  Pin,
  PinOff,
  Trash2,
  Eye,
  MessageSquare,
} from "lucide-react";

function TopicRow({ topic, onAction }: { topic: Topic; onAction: () => void }) {
  const handleToggleLock = async () => {
    try {
      await updateTopic(topic.id, { is_locked: !topic.is_locked });
      toast.success(topic.is_locked ? "Topic unlocked" : "Topic locked");
      onAction();
    } catch (error) {
      toast.error("Failed to update topic");
    }
  };

  const handleTogglePin = async () => {
    try {
      await updateTopic(topic.id, { is_pinned: !topic.is_pinned });
      toast.success(topic.is_pinned ? "Topic unpinned" : "Topic pinned");
      onAction();
    } catch (error) {
      toast.error("Failed to update topic");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTopic(topic.id);
      toast.success("Topic deleted");
      onAction();
    } catch (error) {
      toast.error("Failed to delete topic");
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 border-b border-border last:border-0">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={topic.author?.avatar_url} />
        <AvatarFallback>
          {topic.author?.display_name?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/t/${topic.id}`}
            className="font-medium hover:underline line-clamp-1"
          >
            {topic.title}
          </Link>
          {topic.is_pinned && (
            <Badge variant="secondary" className="text-xs">
              <Pin className="h-3 w-3 mr-1" />
              Pinned
            </Badge>
          )}
          {topic.is_locked && (
            <Badge variant="secondary" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span>by {topic.author?.display_name || "Unknown"}</span>
          <span>&middot;</span>
          <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}</span>
          <span>&middot;</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {topic.view_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {topic.reply_count}
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/t/${topic.id}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Topic
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleTogglePin}>
            {topic.is_pinned ? (
              <>
                <PinOff className="h-4 w-4 mr-2" />
                Unpin Topic
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 mr-2" />
                Pin Topic
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleLock}>
            {topic.is_locked ? (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Topic
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Lock Topic
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Topic
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{topic.title}&quot;?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function ModerationPage() {
  const [tab, setTab] = useState("all");

  const { data: allTopics, isLoading: loadingAll, mutate: mutateAll } = useSWR(
    "moderation-all",
    () => getTopics({ pageSize: 50, sort: "created_at" })
  );

  const { data: pinnedTopics, isLoading: loadingPinned, mutate: mutatePinned } = useSWR(
    "moderation-pinned",
    () => getTopics({ pageSize: 50, is_pinned: true })
  );

  const { data: lockedTopics, isLoading: loadingLocked, mutate: mutateLocked } = useSWR(
    "moderation-locked",
    () => getTopics({ pageSize: 50, is_locked: true })
  );

  const refreshAll = () => {
    mutateAll();
    mutatePinned();
    mutateLocked();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
        <p className="text-muted-foreground mt-1">
          Review and moderate forum topics
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">
            All Topics
            {allTopics && (
              <Badge variant="secondary" className="ml-2">
                {allTopics.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pinned">
            Pinned
            {pinnedTopics && (
              <Badge variant="secondary" className="ml-2">
                {pinnedTopics.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="locked">
            Locked
            {lockedTopics && (
              <Badge variant="secondary" className="ml-2">
                {lockedTopics.data.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Topics</CardTitle>
              <CardDescription>
                Most recently created topics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingAll ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : allTopics?.data && allTopics.data.length > 0 ? (
                allTopics.data.map((topic) => (
                  <TopicRow key={topic.id} topic={topic} onAction={refreshAll} />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No topics found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pinned" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pinned Topics</CardTitle>
              <CardDescription>
                Topics pinned to the top of the forum
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingPinned ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : pinnedTopics?.data && pinnedTopics.data.length > 0 ? (
                pinnedTopics.data.map((topic) => (
                  <TopicRow key={topic.id} topic={topic} onAction={refreshAll} />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No pinned topics
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locked" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Locked Topics</CardTitle>
              <CardDescription>
                Topics that have been locked from further replies
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingLocked ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : lockedTopics?.data && lockedTopics.data.length > 0 ? (
                lockedTopics.data.map((topic) => (
                  <TopicRow key={topic.id} topic={topic} onAction={refreshAll} />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No locked topics
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
