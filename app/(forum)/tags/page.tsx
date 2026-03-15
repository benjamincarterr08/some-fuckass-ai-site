"use client";

import useSWR from "swr";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getTags } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "lucide-react";

export default function TagsPage() {
  const { data: tags, isLoading } = useSWR("tags", () => getTags());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Tag className="h-6 w-6 text-accent" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground mt-0.5">
            Browse discussions by topic tags
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      ) : tags && tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link key={tag.id} href={`/tag/${tag.name}`}>
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm hover:bg-muted-foreground/20 transition-colors cursor-pointer"
              >
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">
          No tags available yet.
        </p>
      )}
    </div>
  );
}
