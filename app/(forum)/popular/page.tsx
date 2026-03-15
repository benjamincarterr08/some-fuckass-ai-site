"use client";

import useSWR from "swr";
import { TopicList } from "@/components/forum/topic-list";
import { getPopularTopics } from "@/lib/api";
import { Flame } from "lucide-react";

export default function PopularPage() {
  const { data: topics, isLoading } = useSWR("feed/popular", getPopularTopics);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Flame className="h-6 w-6 text-accent" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Popular</h1>
          <p className="text-muted-foreground mt-0.5">
            Trending discussions with the most activity
          </p>
        </div>
      </div>

      <TopicList
        topics={topics}
        isLoading={isLoading}
        emptyMessage="No popular topics yet."
      />
    </div>
  );
}
