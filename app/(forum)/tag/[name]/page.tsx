"use client";

import { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopicList } from "@/components/forum/topic-list";
import { getTags, getTagTopics } from "@/lib/api";
import { ArrowLeft, Tag } from "lucide-react";

interface TagPageProps {
  params: Promise<{ name: string }>;
}

export default function TagPage({ params }: TagPageProps) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);

  const { data: tags } = useSWR("tags", () => getTags());
  const tag = tags?.find((t) => t.name.toLowerCase() === decodedName.toLowerCase());

  const { data: topics, isLoading } = useSWR(
    tag ? ["tag-topics", tag.id] : null,
    () => getTagTopics(tag!.id)
  );

  if (!tags) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-5 w-full max-w-md bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Tag not found</h1>
        <p className="text-muted-foreground mb-4">
          The tag &quot;{decodedName}&quot; doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/tags">Browse Tags</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/tags"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Tags
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Tag className="h-6 w-6 text-accent" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">#{tag.name}</h1>
          </div>
          <p className="text-muted-foreground mt-0.5">
            Topics tagged with {tag.name}
          </p>
        </div>
      </div>

      {/* Topics */}
      <TopicList
        topics={topics}
        isLoading={isLoading}
        emptyMessage={`No topics tagged with "${tag.name}" yet.`}
      />
    </div>
  );
}
