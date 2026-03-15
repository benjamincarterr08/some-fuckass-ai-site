"use client";

import Link from "next/link";
import type { Category } from "@/lib/api";
import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  topicCount?: number;
}

export function CategoryCard({ category, topicCount }: CategoryCardProps) {
  return (
    <Link
      href={`/c/${category.slug}`}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30"
    >
      <div
        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: category.color || "#666" }}
      >
        <span className="text-lg font-bold text-white">
          {category.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
            {category.description}
          </p>
        )}
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
    </Link>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div className="h-10 w-10 rounded-lg bg-muted animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
