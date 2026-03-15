"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Flag,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

// Placeholder reports page - would connect to a reports API if available
export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Review user reports and flagged content
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Reports
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Reports resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total This Week
            </CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Reports received</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Queue</CardTitle>
          <CardDescription>
            Reports requiring your attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 mx-auto text-accent mb-4" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-muted-foreground mt-1">
              No pending reports to review.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Common moderation tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="justify-start h-auto py-3">
              <FileText className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Review Topics</div>
                <div className="text-xs text-muted-foreground">
                  View recently created topics
                </div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <MessageSquare className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Review Comments</div>
                <div className="text-xs text-muted-foreground">
                  View recent comment activity
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Types Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Types</CardTitle>
          <CardDescription>
            Types of content that can be reported
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">Spam</p>
                <p className="text-sm text-muted-foreground">
                  Unsolicited promotional content or repetitive posts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium">Harassment</p>
                <p className="text-sm text-muted-foreground">
                  Targeted harassment or bullying of other users
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Inappropriate Content</p>
                <p className="text-sm text-muted-foreground">
                  Content that violates community guidelines
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <AlertTriangle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Off-Topic</p>
                <p className="text-sm text-muted-foreground">
                  Content posted in the wrong category or unrelated to discussion
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
