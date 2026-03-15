"use client";

import useSWR from "swr";
import { CategoryCard, CategoryCardSkeleton } from "@/components/forum/category-card";
import { getCategories } from "@/lib/api";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useSWR("categories", getCategories);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-1">
          Browse all discussion categories
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </>
        ) : categories && categories.length > 0 ? (
          categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))
        ) : (
          <p className="col-span-2 text-center text-muted-foreground py-12">
            No categories available yet.
          </p>
        )}
      </div>
    </div>
  );
}
