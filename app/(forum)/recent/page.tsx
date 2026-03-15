"use client";

import useSWR from "swr";
import { TopicList } from "@/components/forum/topic-list";
import { getRecentTopics } from "@/lib/api";
import { Clock } from "lucide-react";

export default function RecentPage() {
  const { data: topics, isLoading } = useSWR("feed/recent", getRecentTopics);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-6 w-6 text-accent" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recent</h1>
          <p className="text-muted-foreground mt-0.5">
            Latest discussions from the community
          </p>
        </div>
      </div>

      <TopicList
        topics={topics}
        isLoading={isLoading}
        emptyMessage="No recent topics. Be the first to start a discussion!"
      />
    </div>
  );
}
