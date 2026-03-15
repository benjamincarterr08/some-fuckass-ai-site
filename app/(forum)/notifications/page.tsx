"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  Bell,
  MessageSquare,
  AtSign,
  Heart,
  Award,
  Check,
  CheckCheck,
} from "lucide-react";

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  reply: MessageSquare,
  mention: AtSign,
  like: Heart,
  badge: Award,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const {
    data: notifications,
    isLoading,
    mutate,
  } = useSWR(
    user ? ["notifications", user.id] : null,
    () => getUserNotifications(user!.id)
  );

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      mutate();
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsRead(user.id);
      mutate();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-accent" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-0.5">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                : "You're all caught up!"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
            return (
              <Card
                key={notification.id}
                className={cn(
                  "p-4 transition-colors",
                  !notification.is_read && "bg-secondary/50"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      notification.is_read ? "bg-muted" : "bg-accent/20"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        notification.is_read ? "text-muted-foreground" : "text-accent"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/t/${notification.reference_id}`}
                      className="text-sm hover:underline"
                      onClick={() => {
                        if (!notification.is_read) {
                          handleMarkRead(notification.id);
                        }
                      }}
                    >
                      {notification.message}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Mark as read</span>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-muted-foreground mt-1">
            When someone interacts with your content, you&apos;ll see it here.
          </p>
        </div>
      )}
    </div>
  );
}
