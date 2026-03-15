"use client";

import { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TopicList } from "@/components/forum/topic-list";
import { getCategoryBySlug, getCategoryTopics, getTopics, type Topic } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Plus, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

type SortOption = "last_active_at" | "created_at" | "reply_count" | "view_count";

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const { isAuthenticated } = useAuth();
  const [sort, setSort] = useState<SortOption>("last_active_at");

  const { data: category, isLoading: loadingCategory } = useSWR(
    ["category", slug],
    () => getCategoryBySlug(slug)
  );

  const { data: topicsData, isLoading: loadingTopics } = useSWR(
    category ? ["category-topics", category.id, sort] : null,
    () => getTopics({ category_id: category!.id, sort, pageSize: 50 })
  );

  if (loadingCategory) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-5 w-full max-w-md bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Category not found</h1>
        <p className="text-muted-foreground mb-4">
          The category you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/categories">Browse Categories</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/categories"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Categories
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: category.color || "#666" }}
          >
            <span className="text-xl font-bold text-white">
              {category.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground mt-1">{category.description}</p>
            )}
          </div>
        </div>
        {isAuthenticated && (
          <Button asChild className="shrink-0">
            <Link href={`/new?category=${category.id}`}>
              <Plus className="h-4 w-4 mr-1" />
              New Topic
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_active_at">Latest Activity</SelectItem>
            <SelectItem value="created_at">Newest</SelectItem>
            <SelectItem value="reply_count">Most Replies</SelectItem>
            <SelectItem value="view_count">Most Views</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Topics */}
      <TopicList
        topics={topicsData?.data}
        isLoading={loadingTopics}
        showCategory={false}
        emptyMessage={`No topics in ${category.name} yet. Be the first to start a discussion!`}
      />
    </div>
  );
}
