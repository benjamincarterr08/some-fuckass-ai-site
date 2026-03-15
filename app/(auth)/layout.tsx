import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            <span className="text-lg font-semibold">Forum</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
