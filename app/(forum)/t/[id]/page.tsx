"use client";

import { use, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Comment, CommentSkeleton } from "@/components/forum/comment";
import {
  getTopic,
  getProfile,
  getCategory,
  getTopicComments,
  getTopicTags,
  getTopicVotes,
  incrementTopicView,
  voteOnTopic,
  removeTopicVote,
  createComment,
  type Topic,
  type Profile,
  type Category,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Eye,
  Pin,
  Lock,
  Share2,
  Bookmark,
  Flag,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface TopicPageProps {
  params: Promise<{ id: string }>;
}

export default function TopicPage({ params }: TopicPageProps) {
  const { id } = use(params);
  const { isAuthenticated, user } = useAuth();
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch topic
  const { data: topic, isLoading: loadingTopic } = useSWR(
    ["topic", id],
    () => getTopic(id)
  );

  // Fetch author
  const { data: author } = useSWR(
    topic?.created_by ? ["profile", topic.created_by] : null,
    () => getProfile(topic!.created_by)
  );

  // Fetch category
  const { data: category } = useSWR(
    topic?.category_id ? ["category", topic.category_id] : null,
    () => getCategory(topic!.category_id)
  );

  // Fetch comments (only root-level)
  const { data: comments, isLoading: loadingComments, mutate: mutateComments } = useSWR(
    topic ? ["topic-comments", id] : null,
    () => getTopicComments(id).then((comments) =>
      comments.filter((c) => !c.parent_comment_id)
    )
  );

  // Fetch tags
  const { data: tags } = useSWR(
    topic ? ["topic-tags", id] : null,
    () => getTopicTags(id)
  );

  // Fetch votes
  const { data: votesData, mutate: mutateVotes } = useSWR(
    topic ? ["topic-votes", id] : null,
    () => getTopicVotes(id)
  );

  // Increment view count
  useEffect(() => {
    if (topic) {
      incrementTopicView(id).catch(() => {});
    }
  }, [id, topic]);

  const score = votesData?.score ?? 0;
  const userVote = votesData?.votes?.find((v) => v.user_id === user?.id)?.value;

  const handleVote = async (value: 1 | -1) => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to vote");
      return;
    }

    try {
      if (userVote === value) {
        await removeTopicVote(id, user.id);
      } else {
        await voteOnTopic(id, user.id, value);
      }
      mutateVotes();
    } catch {
      toast.error("Failed to vote");
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated || !user || !commentContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment({
        topic_id: id,
        created_by: user.id,
        body: commentContent.trim(),
      });
      setCommentContent("");
      mutateComments();
      toast.success("Comment posted");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (loadingTopic) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        <div className="h-10 w-3/4 bg-muted animate-pulse rounded" />
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Topic not found</h1>
        <p className="text-muted-foreground mb-4">
          The topic you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        {category && (
          <>
            <Link
              href={`/c/${category.slug}`}
              className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: category.color || "#666" }}
              />
              {category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground truncate">{topic.title}</span>
      </div>

      {/* Topic Content */}
      <article className="rounded-lg border border-border bg-card p-6">
        <div className="flex gap-4">
          {/* Voting */}
          <div className="hidden sm:flex flex-col items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${userVote === 1 ? "text-accent" : ""}`}
              onClick={() => handleVote(1)}
            >
              <ChevronUp className="h-5 w-5" />
              <span className="sr-only">Upvote</span>
            </Button>
            <span className="text-lg font-semibold tabular-nums">{score}</span>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${userVote === -1 ? "text-destructive" : ""}`}
              onClick={() => handleVote(-1)}
            >
              <ChevronDown className="h-5 w-5" />
              <span className="sr-only">Downvote</span>
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="flex items-start gap-2 mb-4">
              {topic.is_pinned && <Pin className="h-5 w-5 text-accent shrink-0 mt-1" />}
              {topic.is_locked && <Lock className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />}
              <h1 className="text-2xl font-bold tracking-tight text-balance">{topic.title}</h1>
            </div>

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {author && (
                <Link href={`/u/${author.handle}`} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={author.avatar_url} alt={author.display_name} />
                    <AvatarFallback>
                      {author.display_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium hover:underline">{author.display_name}</span>
                </Link>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span
                  className="flex items-center gap-1"
                  title={format(new Date(topic.created_at), "PPpp")}
                >
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {topic.view_count} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {topic.reply_count} replies
                </span>
              </div>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {tags.map((tag) => (
                  <Link key={tag.id} href={`/tag/${tag.name}`}>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Body */}
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground">{topic.body}</div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
              {/* Mobile voting */}
              <div className="flex sm:hidden items-center gap-1 mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${userVote === 1 ? "text-accent" : ""}`}
                  onClick={() => handleVote(1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium tabular-nums">{score}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${userVote === -1 ? "text-destructive" : ""}`}
                  onClick={() => handleVote(-1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {topic.reply_count} {topic.reply_count === 1 ? "Comment" : "Comments"}
        </h2>

        {/* Comment Form */}
        {isAuthenticated && !topic.is_locked ? (
          <div className="rounded-lg border border-border bg-card p-4 mb-6">
            <Textarea
              placeholder="Share your thoughts..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="min-h-24 bg-secondary mb-3"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !commentContent.trim()}
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        ) : topic.is_locked ? (
          <div className="rounded-lg border border-border bg-card p-4 mb-6 text-center text-muted-foreground">
            <Lock className="h-5 w-5 mx-auto mb-2" />
            This topic is locked. New comments are not allowed.
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-4 mb-6 text-center">
            <p className="text-muted-foreground mb-3">
              Log in to join the discussion
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="divide-y divide-border">
          {loadingComments ? (
            <>
              {[1, 2, 3].map((i) => (
                <CommentSkeleton key={i} />
              ))}
            </>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                topicId={id}
                onReplyPosted={() => mutateComments()}
              />
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
