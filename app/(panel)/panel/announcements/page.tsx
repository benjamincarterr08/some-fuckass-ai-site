"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getSiteSettings,
  updateTopBanner,
  clearTopBanner,
} from "@/lib/api";
import { toast } from "sonner";
import {
  Megaphone,
  Info,
  Bell,
  AlertTriangle,
  Wrench,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
} from "lucide-react";

const BANNER_ICONS = [
  { value: "info", label: "Info", icon: Info, description: "General information" },
  { value: "announcement", label: "Announcement", icon: Megaphone, description: "Important announcement" },
  { value: "update", label: "Update", icon: Bell, description: "Feature updates" },
  { value: "warning", label: "Warning", icon: AlertTriangle, description: "Warning message" },
  { value: "maintenance", label: "Maintenance", icon: Wrench, description: "Maintenance notice" },
  { value: "event", label: "Event", icon: Calendar, description: "Community event" },
  { value: "success", label: "Success", icon: CheckCircle, description: "Good news" },
  { value: "alert", label: "Alert", icon: AlertCircle, description: "Urgent message" },
];

const BANNER_COLORS = [
  { value: "blue", label: "Blue", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "green", label: "Green", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "yellow", label: "Yellow", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "red", label: "Red", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: "purple", label: "Purple", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "orange", label: "Orange", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
];

export default function AnnouncementsPage() {
  const { data: settings, isLoading } = useSWR("site-settings", getSiteSettings);

  const [bannerIcon, setBannerIcon] = useState("");
  const [bannerColor, setBannerColor] = useState("");
  const [bannerText, setBannerText] = useState("");
  const [saving, setSaving] = useState(false);

  // Load settings into state when fetched
  useEffect(() => {
    if (settings) {
      setBannerIcon(settings.top_banner_icon || "");
      setBannerColor(settings.top_banner_colour || "");
      setBannerText(settings.top_banner_text || "");
    }
  }, [settings]);

  const handleUpdateBanner = async () => {
    setSaving(true);
    try {
      await updateTopBanner({
        top_banner_icon: bannerIcon,
        top_banner_colour: bannerColor,
        top_banner_text: bannerText,
      });
      mutate("site-settings");
      toast.success("Announcement published");
    } catch (error) {
      toast.error("Failed to publish announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleClearBanner = async () => {
    setSaving(true);
    try {
      await clearTopBanner();
      setBannerIcon("");
      setBannerColor("");
      setBannerText("");
      mutate("site-settings");
      toast.success("Announcement cleared");
    } catch (error) {
      toast.error("Failed to clear announcement");
    } finally {
      setSaving(false);
    }
  };

  const getColorClass = (color: string) => {
    return BANNER_COLORS.find((c) => c.value === color)?.className || "bg-secondary";
  };

  const IconComponent = BANNER_ICONS.find((i) => i.value === bannerIcon)?.icon;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Publish announcements to the forum
          </p>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="h-40 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground mt-1">
          Publish announcements to the forum top banner
        </p>
      </div>

      {/* Current Banner Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Current Announcement
          </CardTitle>
          <CardDescription>
            This is how your announcement appears to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings?.top_banner_text ? (
            <div className={`p-4 rounded-lg flex items-center gap-3 border ${getColorClass(settings.top_banner_colour || "")}`}>
              {settings.top_banner_icon && (() => {
                const iconData = BANNER_ICONS.find((i) => i.value === settings.top_banner_icon);
                if (iconData) {
                  const Icon = iconData.icon;
                  return <Icon className="h-5 w-5 shrink-0" />;
                }
                return null;
              })()}
              <span>{settings.top_banner_text}</span>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No announcement is currently active
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Announcement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Create Announcement
          </CardTitle>
          <CardDescription>
            Create or update the forum-wide announcement banner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Live Preview */}
          {bannerText && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
              <div className={`p-4 rounded-lg flex items-center gap-3 border ${getColorClass(bannerColor)}`}>
                {IconComponent && <IconComponent className="h-5 w-5 shrink-0" />}
                <span>{bannerText}</span>
              </div>
            </div>
          )}

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-4 gap-2">
              {BANNER_ICONS.map((icon) => (
                <button
                  key={icon.value}
                  type="button"
                  onClick={() => setBannerIcon(icon.value)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    bannerIcon === icon.value
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <icon.icon className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">{icon.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {BANNER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setBannerColor(color.value)}
                  className={`h-12 rounded-lg border transition-all ${color.className} ${
                    bannerColor === color.value
                      ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                      : ""
                  }`}
                >
                  <span className="sr-only">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="banner-text">Message</Label>
            <Input
              id="banner-text"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="Enter your announcement message..."
              className="text-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleUpdateBanner}
              disabled={saving || !bannerText.trim() || !bannerIcon || !bannerColor}
              className="flex-1"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Publish Announcement
            </Button>
            {settings?.top_banner_text && (
              <Button variant="outline" onClick={handleClearBanner} disabled={saving}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Templates</CardTitle>
          <CardDescription>
            Common announcement templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => {
                setBannerIcon("maintenance");
                setBannerColor("yellow");
                setBannerText("Scheduled maintenance tonight at 10 PM UTC.");
              }}
            >
              <Wrench className="h-4 w-4 mr-2 shrink-0" />
              <div className="text-left">
                <div className="font-medium">Maintenance</div>
                <div className="text-xs text-muted-foreground">
                  Scheduled maintenance notice
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => {
                setBannerIcon("announcement");
                setBannerColor("blue");
                setBannerText("Welcome to our forum! Please read the rules before posting.");
              }}
            >
              <Megaphone className="h-4 w-4 mr-2 shrink-0" />
              <div className="text-left">
                <div className="font-medium">Welcome</div>
                <div className="text-xs text-muted-foreground">
                  New member welcome message
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => {
                setBannerIcon("update");
                setBannerColor("green");
                setBannerText("New features have been added! Check out the changelog.");
              }}
            >
              <Bell className="h-4 w-4 mr-2 shrink-0" />
              <div className="text-left">
                <div className="font-medium">Update</div>
                <div className="text-xs text-muted-foreground">
                  New feature announcement
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => {
                setBannerIcon("event");
                setBannerColor("purple");
                setBannerText("Community event this weekend! Join us for discussions and prizes.");
              }}
            >
              <Calendar className="h-4 w-4 mr-2 shrink-0" />
              <div className="text-left">
                <div className="font-medium">Event</div>
                <div className="text-xs text-muted-foreground">
                  Community event notice
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
