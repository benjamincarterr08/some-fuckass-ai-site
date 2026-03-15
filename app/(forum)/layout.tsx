import { Header } from "@/components/forum/header";
import { Sidebar } from "@/components/forum/sidebar";

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">
        <div className="flex gap-8">
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
