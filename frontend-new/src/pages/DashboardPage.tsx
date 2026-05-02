import { useMemo } from "react";
import {
  FileText,
  Library,
  TrendingUp,
  Clock,
  BookOpen,
  ArrowRight,
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
import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 20, stiffness: 100 },
  },
};

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-32 h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="space-y-2">
        <h1 className="display-lg text-3xl md:text-4xl">
          Welcome back,{" "}
          <span className="gradient-text">
            {profile?.full_name?.split(" ")[0] || "there"}
          </span>!
        </h1>
        <p className="text-base text-muted-foreground mt-2">
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
      </motion.header>

      {/* Stats Cards */}
      <motion.section variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <StatsCard
          icon={<FileText className="size-6 text-primary" />}
          label="Total Documents"
          value={stats?.totalDocuments || 0}
          description="Available in the system"
        />
        <StatsCard
          icon={<Library className="size-6 text-secondary" />}
          label="My Library"
          value={stats?.libraryCount || 0}
          description="Documents saved"
        />
        <StatsCard
          icon={<TrendingUp className="size-6 text-tertiary" />}
          label="This Week"
          value={stats?.recentDocuments.length || 0}
          description="New documents added"
        />
      </motion.section>

      {/* Quick Actions & Recent Documents */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Jump right into learning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="w-full justify-between group h-14 rounded-xl"
              >
                <Link to="/documents">
                  <span className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" />
                    Browse Documents
                  </span>
                  <ArrowRight className="size-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="w-full justify-between group h-14 rounded-xl"
              >
                <Link to="/library">
                  <span className="flex items-center gap-3">
                    <Library className="size-5 text-secondary" />
                    View My Library
                  </span>
                  <ArrowRight className="size-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Documents */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">Recent Documents</CardTitle>
                <CardDescription>Latest additions to the library</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary-dim">
                <Link to="/library">
                  View all
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats?.recentDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center mb-4 border border-white/5">
                    <BookOpen className="size-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-foreground font-medium">No documents yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Documents will appear here as they're added
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  {stats?.recentDocuments.map((doc, i) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-[1rem] bg-surface-container-highest/30 border border-white/5 hover:bg-surface-container-highest transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-3 rounded-xl bg-surface-container-high border border-white/5 shrink-0 group-hover:scale-110 transition-transform">
                          <FileText className="size-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-base truncate">{doc.title}</p>
                          {doc.course_code && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {doc.course_code}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high border border-white/5">
                          <Clock className="size-3.5" />
                          {formatDate(doc.created_at)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}

function StatsCard({ icon, label, value, description }: StatsCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full">
        <CardContent className="pt-8 pb-6 px-8 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <p className="label-md text-muted-foreground">{label}</p>
            <div className="p-3 rounded-[1rem] bg-surface-container-highest border border-white/5 shrink-0 shadow-[0_0_15px_rgba(96,99,238,0.1)]">
              {icon}
            </div>
          </div>
          <div>
            <p className="display-lg text-4xl mb-2">{value}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}