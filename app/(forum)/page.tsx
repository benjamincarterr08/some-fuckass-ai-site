"use client";

import useSWR from "swr";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TopicList } from "@/components/forum/topic-list";
import { CategoryCard, CategoryCardSkeleton } from "@/components/forum/category-card";
import { getRecentTopics, getPopularTopics, getCategories, getTopics } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Sparkles, Clock, Flame, TrendingUp } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  
  const { data: recentTopics, isLoading: loadingRecent } = useSWR(
    "feed/recent",
    getRecentTopics
  );
  
  const { data: popularTopics, isLoading: loadingPopular } = useSWR(
    "feed/popular",
    getPopularTopics
  );
  
  const { data: categories, isLoading: loadingCategories } = useSWR(
    "categories",
    getCategories
  );

  const { data: pinnedTopics } = useSWR(
    "topics/pinned",
    () => getTopics({ is_pinned: true, pageSize: 5 })
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      {!isAuthenticated && (
        <section className="rounded-xl bg-gradient-to-br from-secondary to-card border border-border p-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-balance mb-3">
            Welcome to the Community
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Join thousands of members discussing topics that matter. Share knowledge, 
            ask questions, and connect with like-minded people.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Pinned Topics */}
      {pinnedTopics?.data && pinnedTopics.data.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">Pinned</h2>
          </div>
          <TopicList topics={pinnedTopics.data} />
        </section>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="recent" className="gap-1.5">
              <Clock className="h-4 w-4" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="popular" className="gap-1.5">
              <Flame className="h-4 w-4" />
              Popular
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="recent" className="m-0">
          <TopicList
            topics={recentTopics}
            isLoading={loadingRecent}
            emptyMessage="No recent topics. Be the first to start a discussion!"
          />
        </TabsContent>

        <TabsContent value="popular" className="m-0">
          <TopicList
            topics={popularTopics}
            isLoading={loadingPopular}
            emptyMessage="No popular topics yet."
          />
        </TabsContent>
      </Tabs>

      {/* Categories Preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link href="/categories">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {loadingCategories ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </>
          ) : categories && categories.length > 0 ? (
            categories.slice(0, 4).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          ) : (
            <p className="col-span-2 text-center text-muted-foreground py-8">
              No categories available
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
