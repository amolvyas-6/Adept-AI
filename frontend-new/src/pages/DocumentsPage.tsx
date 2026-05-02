import { useState } from "react";
import {
  FileText,
  Grid3X3,
  List,
  Search,
  Plus,
  Filter,
  Loader2,
  BookOpen,
  User,
  Calendar,
  Upload,
  Check,
} from "lucide-react";
import { AddDocumentDialog } from "@/components/add-document-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppData } from "@/contexts/app-data-context";
import { toast } from "sonner";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

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

export function DocumentsPage() {
  const {
    documents,
    courses,
    libraryDocIds,
    initialLoading,
    refreshDocuments,
    addToLibrary,
  } = useAppData();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [addingToLibrary, setAddingToLibrary] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleRefreshDocuments = async () => {
    await refreshDocuments();
    toast.success("Document uploaded successfully");
  };

  const handleAddToLibrary = async (documentId: string) => {
    setAddingToLibrary(documentId);
    try {
      await addToLibrary(documentId);
      toast.success("Document added to library");
    } catch (error: any) {
      toast.error(error.message || "Failed to add to library");
    } finally {
      setAddingToLibrary(null);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse =
      selectedCourse === "all" || doc.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

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
      <motion.header variants={itemVariants} className="space-y-2">
        <h1 className="display-lg text-2xl sm:text-3xl">Documents</h1>
        <p className="text-base text-muted-foreground">
          Browse and discover learning materials from all courses.
        </p>
      </motion.header>

      {/* Filters & View Toggle */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-surface-container-highest/20 p-4 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-surface-container-highest border-white/5"
            />
          </div>

          {/* Course Filter */}
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48 h-12 bg-surface-container-highest border-white/5">
              <Filter className="size-4 mr-2 text-primary" />
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent className="bg-surface-container-highest border border-white/5 backdrop-blur-xl">
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          {/* Add Document Button */}
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            className="h-12 px-6 shadow-[0_10px_20px_rgba(99,102,241,0.2)]"
          >
            <Upload className="size-4 mr-2" />
            Add Document
          </Button>

          {/* View Toggle Slider */}
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
        </div>
      </motion.div>

      {/* Documents Display */}
      {filteredDocuments.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-white/5 bg-surface-container-highest/30 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-surface-container-highest flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                <BookOpen className="size-10 text-muted-foreground/50" />
              </div>
              <p className="text-xl font-medium text-foreground mb-2">
                No documents found
              </p>
              <p className="text-muted-foreground">
                {searchQuery || selectedCourse !== "all"
                  ? "Try adjusting your filters"
                  : "Documents will appear here as they're added"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : viewMode === "grid" ? (
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDocuments.map((doc) => {
              const isInLibrary = libraryDocIds.has(doc.id);
              return (
                <motion.div 
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={cn(
                      "h-full flex flex-col group transition-all duration-300 hover:-translate-y-1 relative overflow-hidden",
                      isInLibrary
                        ? "border-primary-dim/30 bg-primary-dim/5 shadow-[0_20px_40px_rgba(96,99,238,0.05)]"
                        : "border-white/5 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                    )}
                  >
                    {isInLibrary && (
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary-dim/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                    )}
                    <CardHeader className="pb-4 relative z-10 flex-1">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div
                          className={cn(
                            "p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110",
                            isInLibrary ? "bg-primary-dim/20 border border-primary-dim/30" : "bg-surface-container-highest border border-white/5"
                          )}
                        >
                          <FileText
                            className={cn("size-6", isInLibrary ? "text-primary" : "text-muted-foreground")}
                          />
                        </div>
                        {isInLibrary ? (
                          <div className="flex items-center gap-1.5 text-xs text-primary font-medium px-3 py-1.5 rounded-full bg-primary-dim/10 border border-primary-dim/20">
                            <Check className="size-3.5" />
                            <span>In Library</span>
                          </div>
                        ) : (
                          <Button
                            variant="secondary"
                            size="icon-sm"
                            onClick={() => handleAddToLibrary(doc.id)}
                            disabled={addingToLibrary === doc.id}
                            className="opacity-0 group-hover:opacity-100 transition-all rounded-lg translate-y-2 group-hover:translate-y-0"
                          >
                            {addingToLibrary === doc.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Plus className="size-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      <CardTitle className="text-xl line-clamp-2 leading-tight">
                        {doc.title}
                      </CardTitle>
                      {(doc.course_code || doc.course_name) && (
                        <CardDescription className="text-sm mt-2 line-clamp-1">
                          <span className="text-primary-dim font-medium">{doc.course_code}</span> — {doc.course_name}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0 mt-auto relative z-10">
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-white/5">
                        <span className="flex items-center gap-1.5">
                          <User className="size-3.5" />
                          {doc.uploaded_by || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          {formatDate(doc.created_at)}
                        </span>
                      </div>
                      {doc.unit && (
                        <div className="mt-3">
                          <span className="text-xs px-2.5 py-1 rounded-md bg-surface-container-highest text-muted-foreground border border-white/5 font-medium">
                            Unit {doc.unit}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-3">
          <AnimatePresence>
            {filteredDocuments.map((doc) => {
              const isInLibrary = libraryDocIds.has(doc.id);
              return (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={cn(
                      "transition-all duration-300 group overflow-hidden relative",
                      isInLibrary
                        ? "border-primary-dim/30 bg-primary-dim/5"
                        : "border-white/5 hover:border-white/10 hover:bg-surface-container-highest/20"
                    )}
                  >
                    {isInLibrary && (
                      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary-dim/5 to-transparent pointer-events-none" />
                    )}
                    <CardContent className="p-4 sm:p-6 relative z-10">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                        <div className="flex items-start sm:items-center gap-5 min-w-0 flex-1">
                          <div
                            className={cn(
                              "p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110",
                              isInLibrary ? "bg-primary-dim/20 border border-primary-dim/30" : "bg-surface-container-highest border border-white/5"
                            )}
                          >
                            <FileText
                              className={cn("size-6", isInLibrary ? "text-primary" : "text-muted-foreground")}
                            />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <p className="font-semibold text-lg truncate">{doc.title}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              {(doc.course_code || doc.course_name) && (
                                <span className="flex items-center gap-1.5">
                                  <span className="text-primary-dim font-medium">{doc.course_code}</span>
                                  <span className="opacity-50">•</span>
                                  <span className="truncate max-w-[200px]">{doc.course_name}</span>
                                </span>
                              )}
                              <span className="flex items-center gap-1.5">
                                <User className="size-3.5" />
                                {doc.uploaded_by || "Unknown"}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="size-3.5" />
                                {formatDate(doc.created_at)}
                              </span>
                              {doc.unit && (
                                <span className="px-2 py-0.5 rounded-md bg-surface-container-highest border border-white/5 text-xs font-medium">
                                  Unit {doc.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto shrink-0 flex justify-end">
                          {isInLibrary ? (
                            <div className="flex items-center gap-2 text-sm text-primary font-medium px-4 py-2 rounded-lg bg-primary-dim/10 border border-primary-dim/20">
                              <Check className="size-4" />
                              <span>In Library</span>
                            </div>
                          ) : (
                            <Button
                              variant="secondary"
                              className="w-full sm:w-auto h-10"
                              onClick={() => handleAddToLibrary(doc.id)}
                              disabled={addingToLibrary === doc.id}
                            >
                              {addingToLibrary === doc.id ? (
                                <Loader2 className="size-4 animate-spin mr-2" />
                              ) : (
                                <Plus className="size-4 mr-2" />
                              )}
                              Add to Library
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Results count */}
      <motion.p variants={itemVariants} className="text-sm text-muted-foreground text-center pt-8 border-t border-white/5">
        Showing <span className="text-foreground font-medium">{filteredDocuments.length}</span> of <span className="text-foreground font-medium">{documents.length}</span> documents
      </motion.p>

      <AddDocumentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        courses={courses}
        onSuccess={handleRefreshDocuments}
      />
    </motion.div>
  );
}