import { useMemo } from "react";
import {
  FileText,
  Library,
  TrendingUp,
  Clock,
  BookOpen,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useAppData } from "@/contexts/app-data-context";

export function DashboardPage() {
  const { profile } = useAuth();
  const { documents, library, university, initialLoading } = useAppData();

  const stats = useMemo(() => {
    const sortedLibrary = [...library].sort(
      (a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
    );
    const recentDocuments = sortedLibrary.slice(0, 5).map((doc) => ({
      id: doc.document_id,
      title: doc.title,
      course_code: doc.course_code,
      created_at: doc.saved_at,
    }));

    return {
      totalDocuments: documents.length,
      libraryCount: library.length,
      recentDocuments,
    };
  }, [documents, library]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="size-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()},{" "}
          <span className="text-indigo-600 dark:text-indigo-400">
            {profile?.full_name?.split(" ")[0] || "there"}
          </span>
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your learning journey
          {university?.name && (
            <span>
              {" "}
              at{" "}
              <span className="font-medium text-foreground">
                {university.name}
              </span>
            </span>
          )}
          .
        </p>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={<FileText className="size-5 text-indigo-500" />}
          label="Total Documents"
          value={stats?.totalDocuments || 0}
          description="Available in the system"
          delay="delay-100"
        />
        <StatsCard
          icon={<Library className="size-5 text-rose-500" />}
          label="My Library"
          value={stats?.libraryCount || 0}
          description="Documents saved"
          delay="delay-200"
        />
        <StatsCard
          icon={<TrendingUp className="size-5 text-emerald-500" />}
          label="This Week"
          value={stats?.recentDocuments.length || 0}
          description="New documents added"
          delay="delay-300"
        />
      </section>

      {/* Quick Actions & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 border-border/50 bg-card/60 backdrop-blur-sm animate-fade-in-up delay-200">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Jump right into learning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              variant="outline"
              className="w-full justify-between group"
            >
              <Link to="/documents">
                <span className="flex items-center gap-2">
                  <FileText className="size-4" />
                  Browse Documents
                </span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between group"
            >
              <Link to="/library">
                <span className="flex items-center gap-2">
                  <Library className="size-4" />
                  View My Library
                </span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card className="lg:col-span-2 border-border/50 bg-card/60 backdrop-blur-sm animate-fade-in-up delay-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Documents</CardTitle>
              <CardDescription>Latest additions to the library</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link
                to="/library"
                className="text-indigo-600 dark:text-indigo-400"
              >
                View all
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="size-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No documents yet</p>
                <p className="text-sm text-muted-foreground/70">
                  Documents will appear here as they're added
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-indigo-500/10 shrink-0">
                        <FileText className="size-4 text-indigo-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        {doc.course_code && (
                          <p className="text-xs text-muted-foreground">
                            {doc.course_code}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDate(doc.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  delay?: string;
}

function StatsCard({ icon, label, value, description, delay }: StatsCardProps) {
  return (
    <Card
      className={`border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card hover:border-border transition-all group animate-fade-in-up ${delay}`}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="p-3 rounded-xl bg-muted group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
