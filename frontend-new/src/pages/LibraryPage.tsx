import { useState } from "react";
import {
  FileText,
  Trash2,
  Loader2,
  Library,
  Clock,
  BookOpen,
  Grid3X3,
  List,
  MessageSquare,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/contexts/app-data-context";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence, type Variants } from "framer-motion";

type ViewMode = "grid" | "list";

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

export function LibraryPage() {
  const navigate = useNavigate();
  const { library, initialLoading, removeFromLibrary } = useAppData();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [creatingChatId, setCreatingChatId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const handleRemove = async (documentId: string) => {
    setRemovingId(documentId);
    try {
      await removeFromLibrary(documentId);
      toast.success("Document removed from library");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove document");
    } finally {
      setRemovingId(null);
    }
  };

  const handleStartChat = async (documentId: string) => {
    setCreatingChatId(documentId);
    try {
      const chat = await api.createChat(documentId);
      navigate(`/chats/${chat._id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create chat");
    } finally {
      setCreatingChatId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="display-lg text-2xl sm:text-3xl">My Library</h1>
          <p className="text-base text-muted-foreground">
            Your personal collection of saved learning materials.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-surface-container-highest/40 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="p-2 rounded-lg bg-surface-container-highest border border-white/5 shadow-inner">
              <Library className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{library.length}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Saved</p>
            </div>
          </div>

          {/* View Toggle Slider */}
          {library.length > 0 && (
            <div className="relative flex items-center w-20 h-12 p-1.5 bg-surface-container-highest rounded-xl border border-white/5">
              <div
                className={`absolute w-8 h-9 bg-surface-container-low rounded-lg shadow-sm transition-transform duration-300 ease-out border border-white/5 ${
                  viewMode === "list" ? "translate-x-8" : "translate-x-0"
                }`}
              />
              <button
                onClick={() => setViewMode("grid")}
                className={`relative z-10 flex items-center justify-center w-8 h-9 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid3X3 className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`relative z-10 flex items-center justify-center w-8 h-9 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="size-4" />
              </button>
            </div>
          )}
        </div>
      </motion.header>

      {/* Library Items */}
      {library.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-white/5 bg-surface-container-highest/30 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-surface-container-highest flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                <BookOpen className="size-10 text-muted-foreground/50" />
              </div>
              <p className="text-xl font-medium text-foreground mb-2">
                Your library is empty
              </p>
              <p className="text-muted-foreground mb-6">
                Start adding documents from the Documents page
              </p>
              <Button
                asChild
                className="h-12 px-8 shadow-[0_10px_20px_rgba(99,102,241,0.2)]"
              >
                <Link to="/documents">Browse Documents</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : viewMode === "grid" ? (
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {library.map((item) => (
              <motion.div
                key={item.document_id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full flex flex-col group border-white/5 bg-surface-container-low hover:bg-surface-container-low/80 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-dim/5 blur-3xl rounded-full pointer-events-none" />
                  <CardHeader className="pb-4 relative z-10 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="p-3 rounded-xl bg-surface-container-highest border border-white/5 shrink-0 transition-transform group-hover:scale-110">
                        <FileText className="size-6 text-primary" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemove(item.document_id)}
                        disabled={removingId === item.document_id}
                        className="opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive rounded-lg translate-y-2 group-hover:translate-y-0"
                      >
                        {removingId === item.document_id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                    <CardTitle className="text-xl line-clamp-2 leading-tight mt-2">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-sm mt-2 line-clamp-1">
                      <span className="text-primary-dim font-medium">{item.course_code}</span> — {item.course_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 mt-auto relative z-10">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-white/5 mb-4">
                      <Clock className="size-3.5" />
                      Saved {formatDate(item.saved_at)}
                    </div>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => handleStartChat(item.document_id)}
                      disabled={creatingChatId === item.document_id}
                      className="w-full gap-2 rounded-xl h-12 bg-surface-container-highest hover:bg-surface-container-highest/80 border-white/5 hover:border-primary-dim/30"
                    >
                      {creatingChatId === item.document_id ? (
                        <Loader2 className="size-5 animate-spin text-primary" />
                      ) : (
                        <MessageSquare className="size-5 text-primary" />
                      )}
                      New Chat
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-4">
          <AnimatePresence>
            {library.map((item) => (
              <motion.div
                key={item.document_id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group overflow-hidden relative border-white/5 hover:border-white/10 bg-surface-container-low hover:bg-surface-container-low/80 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary-dim/5 to-transparent pointer-events-none" />
                  <CardContent className="p-4 sm:p-6 relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                      <div className="flex items-start sm:items-center gap-5 min-w-0 flex-1">
                        <div className="p-3 rounded-xl bg-surface-container-highest border border-white/5 shrink-0 transition-transform group-hover:scale-110">
                          <FileText className="size-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className="font-semibold text-lg truncate">{item.title}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <span className="text-primary-dim font-medium">{item.course_code}</span>
                              <span className="opacity-50">•</span>
                              <span className="truncate max-w-[200px]">{item.course_name}</span>
                            </span>
                            {item.uploader && (
                              <span className="flex items-center gap-1.5">
                                <span className="opacity-50">•</span>
                                Uploaded by {item.uploader}
                              </span>
                            )}
                            {item.unit && (
                              <span className="px-2 py-0.5 rounded-md bg-surface-container-highest border border-white/5 text-xs font-medium">
                                Unit {item.unit}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <span className="opacity-50">•</span>
                              <Clock className="size-3.5" />
                              Saved {formatDate(item.saved_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStartChat(item.document_id)}
                          disabled={creatingChatId === item.document_id}
                          className="h-10 px-4 rounded-lg bg-surface-container-highest hover:bg-surface-container-highest/80 border-white/5 hover:border-primary-dim/30"
                        >
                          {creatingChatId === item.document_id ? (
                            <Loader2 className="size-4 animate-spin text-primary mr-2" />
                          ) : (
                            <MessageSquare className="size-4 text-primary mr-2" />
                          )}
                          New Chat
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemove(item.document_id)}
                          disabled={removingId === item.document_id}
                          className="text-muted-foreground hover:text-destructive h-10 w-10 rounded-lg hover:bg-destructive/10"
                        >
                          {removingId === item.document_id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}