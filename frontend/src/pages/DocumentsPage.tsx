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

type ViewMode = "grid" | "list";

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
        <Loader2 className="size-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Browse and discover learning materials from all courses.
        </p>
      </header>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Course Filter */}
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-45">
              <Filter className="size-4 mr-2" />
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Document Button */}
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Upload className="size-4 mr-2" />
            Add Document
          </Button>

          {/* View Toggle Slider */}
          <div className="relative flex items-center w-18 h-9 p-1 bg-muted rounded-lg border border-border/50">
            <div
              className={`absolute w-8 h-7 bg-background rounded-md shadow-sm transition-transform duration-200 ${
                viewMode === "list" ? "translate-x-8" : "translate-x-0"
              }`}
            />
            <button
              onClick={() => setViewMode("grid")}
              className={`relative z-10 flex items-center justify-center w-8 h-7 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Grid3X3 className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`relative z-10 flex items-center justify-center w-8 h-7 rounded-md transition-colors ${
                viewMode === "list"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Display */}
      {filteredDocuments.length === 0 ? (
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No documents found
            </p>
            <p className="text-sm text-muted-foreground/70">
              {searchQuery || selectedCourse !== "all"
                ? "Try adjusting your filters"
                : "Documents will appear here as they're added"}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const isInLibrary = libraryDocIds.has(doc.id);
            return (
              <Card
                key={doc.id}
                className={`backdrop-blur-sm hover:border-border transition-all group ${
                  isInLibrary
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-border/50 bg-card/60 hover:bg-card"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${isInLibrary ? "bg-emerald-500/10" : "bg-indigo-500/10"}`}
                    >
                      <FileText
                        className={`size-5 ${isInLibrary ? "text-emerald-500" : "text-indigo-500"}`}
                      />
                    </div>
                    {isInLibrary ? (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3.5" />
                        <span>In Library</span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleAddToLibrary(doc.id)}
                        disabled={addingToLibrary === doc.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {addingToLibrary === doc.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Plus className="size-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <CardTitle className="text-base line-clamp-2 mt-2">
                    {doc.title}
                  </CardTitle>
                  {(doc.course_code || doc.course_name) && (
                    <CardDescription>
                      {doc.course_code} - {doc.course_name}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      {doc.uploaded_by || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {formatDate(doc.created_at)}
                    </span>
                  </div>
                  {doc.unit && (
                    <div className="mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Unit {doc.unit}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map((doc) => {
            const isInLibrary = libraryDocIds.has(doc.id);
            return (
              <Card
                key={doc.id}
                className={`backdrop-blur-sm hover:border-border transition-all group ${
                  isInLibrary
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-border/50 bg-card/60 hover:bg-card"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${isInLibrary ? "bg-emerald-500/10" : "bg-indigo-500/10"}`}
                      >
                        <FileText
                          className={`size-5 ${isInLibrary ? "text-emerald-500" : "text-indigo-500"}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{doc.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {(doc.course_code || doc.course_name) && (
                            <span>
                              {doc.course_code} - {doc.course_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <User className="size-3" />
                            {doc.uploaded_by || "Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatDate(doc.created_at)}
                          </span>
                          {doc.unit && <span>Unit {doc.unit}</span>}
                        </div>
                      </div>
                    </div>
                    {isInLibrary ? (
                      <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Check className="size-4" />
                        <span>In Library</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToLibrary(doc.id)}
                        disabled={addingToLibrary === doc.id}
                        className="shrink-0"
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground text-center">
        Showing {filteredDocuments.length} of {documents.length} documents
      </p>

      <AddDocumentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        courses={courses}
        onSuccess={handleRefreshDocuments}
      />
    </div>
  );
}
