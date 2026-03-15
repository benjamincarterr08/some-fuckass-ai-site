"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Comment as CommentType, Profile } from "@/lib/api";
import {
  voteOnComment,
  removeCommentVote,
  createComment,
  getCommentReplies,
  getProfile,
  getCommentVotes,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  MoreHorizontal,
  Reply,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";

interface CommentProps {
  comment: CommentType;
  topicId: string;
  author?: Profile;
  depth?: number;
  onReplyPosted?: () => void;
}

export function Comment({
  comment,
  topicId,
  author: initialAuthor,
  depth = 0,
  onReplyPosted,
}: CommentProps) {
  const { isAuthenticated, user, profile } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 2);

  // Fetch author if not provided
  const { data: author } = useSWR(
    !initialAuthor && comment.created_by ? ["profile", comment.created_by] : null,
    () => getProfile(comment.created_by)
  );

  // Fetch votes
  const { data: votesData, mutate: mutateVotes } = useSWR(
    ["comment-votes", comment.id],
    () => getCommentVotes(comment.id)
  );

  // Fetch replies
  const { data: replies, mutate: mutateReplies } = useSWR(
    showReplies ? ["comment-replies", comment.id] : null,
    () => getCommentReplies(comment.id)
  );

  const authorData = initialAuthor || author;
  const score = votesData?.score ?? comment.score ?? 0;
  const userVote = votesData?.votes?.find((v) => v.user_id === user?.id)?.value;

  const handleVote = async (value: 1 | -1) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to vote");
      return;
    }

    try {
      if (userVote === value) {
        await removeCommentVote(comment.id, user.id);
      } else {
        await voteOnComment(comment.id, user.id, value);
      }
      mutateVotes();
    } catch {
      toast.error("Failed to vote");
    }
  };

  const handleSubmitReply = async () => {
    if (!isAuthenticated || !user || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment({
        topic_id: topicId,
        parent_comment_id: comment.id,
        created_by: user.id,
        body: replyContent.trim(),
      });
      setReplyContent("");
      setShowReplyForm(false);
      setShowReplies(true);
      mutateReplies();
      onReplyPosted?.();
      toast.success("Reply posted");
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxDepth = 4;
  const canNest = depth < maxDepth;

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l border-border" : ""}>
      <article className="group py-4">
        <div className="flex gap-3">
          {/* Vote Buttons */}
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${userVote === 1 ? "text-accent" : ""}`}
              onClick={() => handleVote(1)}
            >
              <ChevronUp className="h-4 w-4" />
              <span className="sr-only">Upvote</span>
            </Button>
            <span className="text-sm font-medium tabular-nums">{score}</span>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${userVote === -1 ? "text-destructive" : ""}`}
              onClick={() => handleVote(-1)}
            >
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Downvote</span>
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              {authorData && (
                <>
                  <Link href={`/u/${authorData.handle}`}>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={authorData.avatar_url} alt={authorData.display_name} />
                      <AvatarFallback className="text-xs">
                        {authorData.display_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <Link
                    href={`/u/${authorData.handle}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {authorData.display_name}
                  </Link>
                </>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              {comment.updated_at && comment.updated_at !== comment.created_at && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>

            {/* Body */}
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="text-sm text-foreground whitespace-pre-wrap">{comment.body}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-2">
              {isAuthenticated && canNest && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
              {replies && replies.length > 0 && !showReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={() => setShowReplies(true)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {replies.length} {replies.length === 1 ? "reply" : "replies"}
                </Button>
              )}
            </div>

            {/* Reply Form */}
            {showReplyForm && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-20 bg-secondary"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={isSubmitting || !replyContent.trim()}
                  >
                    {isSubmitting ? "Posting..." : "Post Reply"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Nested Replies */}
      {showReplies && replies && replies.length > 0 && (
        <div className="space-y-0">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              topicId={topicId}
              depth={depth + 1}
              onReplyPosted={() => {
                mutateReplies();
                onReplyPosted?.();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="py-4">
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="h-7 w-7 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-7 w-7 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
