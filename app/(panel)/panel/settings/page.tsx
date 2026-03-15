"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getSiteSettings,
  updateSiteSettings,
  toggleMaintenanceMode,
  updateTopBanner,
  clearTopBanner,
} from "@/lib/api";
import { toast } from "sonner";
import {
  Settings,
  AlertTriangle,
  Megaphone,
  Info,
  Bell,
  Wrench,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";

const BANNER_ICONS = [
  { value: "info", label: "Info", icon: Info },
  { value: "announcement", label: "Announcement", icon: Megaphone },
  { value: "update", label: "Update", icon: Bell },
  { value: "warning", label: "Warning", icon: AlertTriangle },
  { value: "maintenance", label: "Maintenance", icon: Wrench },
  { value: "event", label: "Event", icon: Calendar },
  { value: "success", label: "Success", icon: CheckCircle },
  { value: "alert", label: "Alert", icon: AlertCircle },
];

const BANNER_COLORS = [
  { value: "blue", label: "Blue", className: "bg-blue-500" },
  { value: "green", label: "Green", className: "bg-green-500" },
  { value: "yellow", label: "Yellow", className: "bg-yellow-500" },
  { value: "red", label: "Red", className: "bg-red-500" },
  { value: "purple", label: "Purple", className: "bg-purple-500" },
  { value: "orange", label: "Orange", className: "bg-orange-500" },
];

export default function SiteSettingsPage() {
  const { data: settings, isLoading } = useSWR("site-settings", getSiteSettings);

  const [forumName, setForumName] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [bannerIcon, setBannerIcon] = useState("");
  const [bannerColor, setBannerColor] = useState("");
  const [bannerText, setBannerText] = useState("");
  const [saving, setSaving] = useState(false);

  // Load settings into state when fetched
  useEffect(() => {
    if (settings) {
      setForumName(settings.forum_name || "");
      setMaintenanceMode(settings.maintenance_mode || false);
      setBannerIcon(settings.top_banner_icon || "");
      setBannerColor(settings.top_banner_colour || "");
      setBannerText(settings.top_banner_text || "");
    }
  }, [settings]);

  const handleSaveForumName = async () => {
    setSaving(true);
    try {
      await updateSiteSettings({ forum_name: forumName });
      mutate("site-settings");
      toast.success("Forum name updated");
    } catch (error) {
      toast.error("Failed to update forum name");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenance = async (enabled: boolean) => {
    setSaving(true);
    try {
      await toggleMaintenanceMode(enabled);
      setMaintenanceMode(enabled);
      mutate("site-settings");
      toast.success(enabled ? "Maintenance mode enabled" : "Maintenance mode disabled");
    } catch (error) {
      toast.error("Failed to toggle maintenance mode");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBanner = async () => {
    setSaving(true);
    try {
      await updateTopBanner({
        top_banner_icon: bannerIcon,
        top_banner_colour: bannerColor,
        top_banner_text: bannerText,
      });
      mutate("site-settings");
      toast.success("Banner updated");
    } catch (error) {
      toast.error("Failed to update banner");
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
      toast.success("Banner cleared");
    } catch (error) {
      toast.error("Failed to clear banner");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure global forum settings
          </p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-8">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure global forum settings
        </p>
      </div>

      {/* Forum Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General
          </CardTitle>
          <CardDescription>Basic forum configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forum-name">Forum Name</Label>
            <div className="flex gap-2">
              <Input
                id="forum-name"
                value={forumName}
                onChange={(e) => setForumName(e.target.value)}
                placeholder="My Forum"
              />
              <Button onClick={handleSaveForumName} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Mode
          </CardTitle>
          <CardDescription>
            When enabled, only staff members can access the forum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">
                {maintenanceMode ? "Maintenance mode is ON" : "Maintenance mode is OFF"}
              </p>
              <p className="text-sm text-muted-foreground">
                {maintenanceMode
                  ? "The forum is only accessible to staff members"
                  : "The forum is accessible to everyone"}
              </p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={handleToggleMaintenance}
              disabled={saving}
            />
          </div>
          {maintenanceMode && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Maintenance mode is currently active
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Banner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Top Banner
          </CardTitle>
          <CardDescription>
            Display an announcement banner at the top of the forum
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Banner Preview */}
          {bannerText && (
            <div
              className={`p-3 rounded-lg flex items-center gap-3 ${
                bannerColor === "blue"
                  ? "bg-blue-500/20 text-blue-400"
                  : bannerColor === "green"
                  ? "bg-green-500/20 text-green-400"
                  : bannerColor === "yellow"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : bannerColor === "red"
                  ? "bg-red-500/20 text-red-400"
                  : bannerColor === "purple"
                  ? "bg-purple-500/20 text-purple-400"
                  : bannerColor === "orange"
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-secondary"
              }`}
            >
              {bannerIcon && (() => {
                const iconData = BANNER_ICONS.find((i) => i.value === bannerIcon);
                if (iconData) {
                  const Icon = iconData.icon;
                  return <Icon className="h-4 w-4" />;
                }
                return null;
              })()}
              <span className="text-sm">{bannerText}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="banner-icon">Icon</Label>
              <Select value={bannerIcon} onValueChange={setBannerIcon}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {BANNER_ICONS.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center gap-2">
                        <icon.icon className="h-4 w-4" />
                        {icon.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-color">Color</Label>
              <Select value={bannerColor} onValueChange={setBannerColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {BANNER_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded ${color.className}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-text">Banner Text</Label>
            <Input
              id="banner-text"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="Enter announcement text..."
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpdateBanner} disabled={saving || !bannerText.trim()}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Banner
            </Button>
            {settings?.top_banner_text && (
              <Button variant="outline" onClick={handleClearBanner} disabled={saving}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Banner
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
