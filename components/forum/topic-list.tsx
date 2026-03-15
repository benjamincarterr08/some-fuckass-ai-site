"use client";

import useSWR from "swr";
import { TopicCard, TopicCardSkeleton } from "./topic-card";
import { getProfile, getCategory, type Topic, type Profile, type Category } from "@/lib/api";
import { Empty } from "@/components/ui/empty";
import { MessageSquare } from "lucide-react";

interface TopicListProps {
  topics: Topic[] | undefined;
  isLoading?: boolean;
  showCategory?: boolean;
  emptyMessage?: string;
}

// Hook to fetch author and category data for topics
function useTopicEnrichedData(topics: Topic[] | undefined) {
  // Get unique author and category IDs
  const authorIds = [...new Set(topics?.map((t) => t.created_by).filter(Boolean) || [])];
  const categoryIds = [...new Set(topics?.map((t) => t.category_id).filter(Boolean) || [])];

  // Fetch all profiles
  const { data: profiles } = useSWR(
    authorIds.length ? ["profiles", authorIds] : null,
    async () => {
      const results = await Promise.all(authorIds.map((id) => getProfile(id).catch(() => null)));
      const map = new Map<string, Profile>();
      results.forEach((profile, i) => {
        if (profile) map.set(authorIds[i], profile);
      });
      return map;
    }
  );

  // Fetch all categories
  const { data: categories } = useSWR(
    categoryIds.length ? ["categories-map", categoryIds] : null,
    async () => {
      const results = await Promise.all(categoryIds.map((id) => getCategory(id).catch(() => null)));
      const map = new Map<string, Category>();
      results.forEach((category, i) => {
        if (category) map.set(categoryIds[i], category);
      });
      return map;
    }
  );

  return { profiles, categories };
}

export function TopicList({
  topics,
  isLoading,
  showCategory = true,
  emptyMessage = "No topics found",
}: TopicListProps) {
  const { profiles, categories } = useTopicEnrichedData(topics);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <TopicCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <Empty
        icon={MessageSquare}
        title="No topics yet"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="space-y-3">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          author={profiles?.get(topic.created_by)}
          category={categories?.get(topic.category_id)}
          showCategory={showCategory}
        />
      ))}
    </div>
  );
}
