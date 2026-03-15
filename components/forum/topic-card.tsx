"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Topic, Profile, Category } from "@/lib/api";
import { MessageSquare, Eye, Pin, Lock, ArrowUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TopicCardProps {
  topic: Topic;
  author?: Profile;
  category?: Category;
  showCategory?: boolean;
}

export function TopicCard({ topic, author, category, showCategory = true }: TopicCardProps) {
  const authorData = author || topic.author;
  const categoryData = category || topic.category;

  return (
    <article className="group relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30">
      <div className="flex gap-4">
        {/* Author Avatar */}
        {authorData && (
          <Link href={`/u/${authorData.handle}`} className="shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={authorData.avatar_url} alt={authorData.display_name} />
              <AvatarFallback>
                {authorData.display_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}

        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-start gap-2 mb-1">
            {topic.is_pinned && (
              <Pin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            )}
            {topic.is_locked && (
              <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <Link href={`/t/${topic.id}`} className="min-w-0 flex-1">
              <h2 className="text-base font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2 text-balance">
                {topic.title}
              </h2>
            </Link>
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {authorData && (
              <Link
                href={`/u/${authorData.handle}`}
                className="hover:text-foreground transition-colors"
              >
                {authorData.display_name}
              </Link>
            )}
            {showCategory && categoryData && (
              <Link
                href={`/c/${categoryData.slug}`}
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: categoryData.color || "#666" }}
                />
                {categoryData.name}
              </Link>
            )}
            <span title={new Date(topic.created_at).toLocaleString()}>
              {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Preview text - first 150 chars */}
          {topic.body && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {topic.body.slice(0, 150)}
              {topic.body.length > 150 && "..."}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="hidden sm:flex flex-col items-end gap-2 text-sm text-muted-foreground shrink-0">
          <div className="flex items-center gap-1" title={`${topic.reply_count} replies`}>
            <MessageSquare className="h-4 w-4" />
            <span>{topic.reply_count || 0}</span>
          </div>
          <div className="flex items-center gap-1" title={`${topic.view_count} views`}>
            <Eye className="h-4 w-4" />
            <span>{topic.view_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {topic.tags && topic.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pl-14">
          {topic.tags.slice(0, 5).map((tag) => (
            <Link key={tag.id} href={`/tag/${tag.name}`}>
              <Badge variant="secondary" className="text-xs font-normal">
                {tag.name}
              </Badge>
            </Link>
          ))}
          {topic.tags.length > 5 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{topic.tags.length - 5} more
            </Badge>
          )}
        </div>
      )}
    </article>
  );
}

export function TopicCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex gap-4">
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
          <div className="flex gap-3">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
        </div>
        <div className="hidden sm:flex flex-col gap-2 shrink-0">
          <div className="h-5 w-12 bg-muted animate-pulse rounded" />
          <div className="h-5 w-12 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
