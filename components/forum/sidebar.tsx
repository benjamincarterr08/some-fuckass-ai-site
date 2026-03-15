"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { getCategories, type Category } from "@/lib/api";
import {
  Home,
  Flame,
  Clock,
  Tag,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/popular", label: "Popular", icon: Flame },
  { href: "/recent", label: "Recent", icon: Clock },
  { href: "/tags", label: "Tags", icon: Tag },
];

// Map category icons to Lucide icons
function getCategoryIcon(iconName: string) {
  // Return a simple colored dot for categories
  return null;
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: categories, isLoading } = useSWR("categories", getCategories);

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Categories */}
        <div className="mt-8">
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </h3>
            <Link
              href="/categories"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
          </div>
          <nav className="space-y-1">
            {isLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </>
            ) : categories && categories.length > 0 ? (
              categories.slice(0, 8).map((category) => {
                const isActive = pathname === `/c/${category.slug}`;
                return (
                  <Link
                    key={category.id}
                    href={`/c/${category.slug}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors group",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: category.color || "#666" }}
                    />
                    <span className="truncate flex-1">{category.name}</span>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })
            ) : (
              <p className="px-3 py-2 text-sm text-muted-foreground">No categories yet</p>
            )}
          </nav>
        </div>
      </div>
    </aside>
  );
}
