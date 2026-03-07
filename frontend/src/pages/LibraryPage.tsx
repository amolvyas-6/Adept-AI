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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/contexts/app-data-context";
import { api } from "@/lib/api";
import { toast } from "sonner";

type ViewMode = "grid" | "list";

export function LibraryPage() {
  const navigate = useNavigate();
  const { library, initialLoading, removeFromLibrary } = useAppData();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [creatingChatId, setCreatingChatId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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
        <Loader2 className="size-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
          <p className="text-muted-foreground">
            Your personal collection of saved learning materials.
          </p>
        </div>

        {/* View Toggle Slider */}
        {library.length > 0 && (
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
        )}
      </header>

      {/* Library Stats */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10">
              <Library className="size-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{library.length}</p>
              <p className="text-sm text-muted-foreground">
                {library.length === 1 ? "Document" : "Documents"} saved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Library Items */}
      {library.length === 0 ? (
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Your library is empty
            </p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              Start adding documents from the Documents page
            </p>
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Link to="/documents">Browse Documents</Link>
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {library.map((item) => (
            <Card
              key={item.document_id}
              className="border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card hover:border-border transition-all group"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 shrink-0">
                    <FileText className="size-5 text-indigo-500" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemove(item.document_id)}
                    disabled={removingId === item.document_id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    {removingId === item.document_id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
                <p className="font-medium line-clamp-2 mt-3">{item.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.course_code} - {item.course_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                  <Clock className="size-3" />
                  Saved {formatDate(item.saved_at)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartChat(item.document_id)}
                  disabled={creatingChatId === item.document_id}
                  className="mt-3 w-full gap-2"
                >
                  {creatingChatId === item.document_id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MessageSquare className="size-4" />
                  )}
                  New Chat
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {library.map((item) => (
            <Card
              key={item.document_id}
              className="border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card hover:border-border transition-all group"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-indigo-500/10 shrink-0">
                      <FileText className="size-5 text-indigo-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{item.title}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-foreground/80">
                          {item.course_code}
                        </span>
                        <span>{item.course_name}</span>
                        {item.uploader && (
                          <span>Uploaded by {item.uploader}</span>
                        )}
                        {item.unit && <span>Unit {item.unit}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          Saved {formatDate(item.saved_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartChat(item.document_id)}
                      disabled={creatingChatId === item.document_id}
                      className="gap-2"
                    >
                      {creatingChatId === item.document_id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <MessageSquare className="size-4" />
                      )}
                      New Chat
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemove(item.document_id)}
                      disabled={removingId === item.document_id}
                      className="text-muted-foreground hover:text-destructive"
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
          ))}
        </div>
      )}
    </div>
  );
}
