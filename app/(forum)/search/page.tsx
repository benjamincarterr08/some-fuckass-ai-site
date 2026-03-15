"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TopicList } from "@/components/forum/topic-list";
import { search } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import {
  Search as SearchIcon,
  FileText,
  MessageSquare,
  Users,
  ArrowRight,
} from "lucide-react";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);

  const { data: results, isLoading } = useSWR(
    submittedQuery ? ["search", submittedQuery] : null,
    () => search(submittedQuery)
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSubmittedQuery(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      setSubmittedQuery(q);
    }
  }, [searchParams]);

  const hasResults =
    results &&
    (results.topics.length > 0 ||
      results.comments.length > 0 ||
      results.profiles.length > 0);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center gap-3">
        <SearchIcon className="h-6 w-6 text-accent" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Search</h1>
          <p className="text-muted-foreground mt-0.5">
            Find topics, comments, and users
          </p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : submittedQuery && !hasResults ? (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No results found</p>
          <p className="text-muted-foreground mt-1">
            Try different keywords or check your spelling
          </p>
        </div>
      ) : hasResults ? (
        <Tabs defaultValue="topics">
          <TabsList>
            <TabsTrigger value="topics" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Topics ({results?.topics.length || 0})
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Comments ({results?.comments.length || 0})
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-4 w-4" />
              Users ({results?.profiles.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="mt-4">
            {results?.topics && results.topics.length > 0 ? (
              <TopicList topics={results.topics} />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No topics found
              </p>
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            {results?.comments && results.comments.length > 0 ? (
              <div className="space-y-3">
                {results.comments.map((comment) => (
                  <Link
                    key={comment.id}
                    href={`/t/${comment.topic_id}`}
                    className="block rounded-lg border border-border bg-card p-4 hover:border-muted-foreground/30 transition-colors"
                  >
                    <p className="text-sm text-foreground line-clamp-3">
                      {comment.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No comments found
              </p>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            {results?.profiles && results.profiles.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {results.profiles.map((profile) => (
                  <Link
                    key={profile.id}
                    href={`/u/${profile.handle}`}
                    className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:border-muted-foreground/30 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={profile.avatar_url}
                        alt={profile.display_name}
                      />
                      <AvatarFallback>
                        {profile.display_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{profile.display_name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{profile.handle}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No users found
              </p>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Enter a search term to get started
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Spinner className="h-8 w-8" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
