import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Loader2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Send,
  Plus,
  X,
  FileText,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  api,
  type Document as DocumentType,
  type Chat,
  type ChatMessage,
  type LibraryItem,
} from "@/lib/api";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function ChatsPage() {
  const { id: chatId } = useParams<{ id: string }>();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);

  // Document management state
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [addingDocId, setAddingDocId] = useState<string | null>(null);
  const [removingDocId, setRemovingDocId] = useState<string | null>(null);
  const [addDocDialogOpen, setAddDocDialogOpen] = useState(false);

  // Dynamic PDF width via container ref
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [pdfWidth, setPdfWidth] = useState<number>(500);

  const suggestions = [
    "What is the main topic of this document?",
    "Summarize the key points.",
    "Explain the concepts in simple terms.",
  ];

  // Observe the PDF container width for dynamic sizing
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Leave some padding (32px total) so the PDF doesn't touch the edges
        const width = Math.floor(entry.contentRect.width - 32);
        if (width > 0) setPdfWidth(width);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
    }
  }, [chatId]);

  const loadChat = async (id: string) => {
    try {
      // Fetch the existing chat
      const chatData = await api.getChat(id);
      setChat(chatData);
      setMessages(chatData.messages || []);

      // Fetch all documents associated with this chat
      const docPromises = chatData.document_ids.map((docId) =>
        api.getDocument(docId)
      );
      const docs = await Promise.all(docPromises);
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load chat:", error);
      toast.error("Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  // Fetch library items for the "Add Document" dialog
  const fetchLibrary = useCallback(async () => {
    setLibraryLoading(true);
    try {
      const data = await api.getLibrary();
      setLibraryItems(data);
    } catch (error) {
      console.error("Failed to fetch library:", error);
      toast.error("Failed to load library");
    } finally {
      setLibraryLoading(false);
    }
  }, []);

  const handleAddDocument = async (documentId: string) => {
    if (!chat) return;
    setAddingDocId(documentId);
    try {
      await api.addDocumentToChat(chat._id, documentId);
      // Fetch the full document and add it to state
      const doc = await api.getDocument(documentId);
      setDocuments((prev) => [...prev, doc]);
      setChat((prev) =>
        prev
          ? { ...prev, document_ids: [...prev.document_ids, documentId] }
          : prev
      );
      toast.success("Document added to chat");
      setAddDocDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add document");
    } finally {
      setAddingDocId(null);
    }
  };

  const handleRemoveDocument = async (documentId: string, index: number) => {
    if (!chat) return;
    if (documents.length <= 1) {
      toast.error("Chat must have at least one document");
      return;
    }
    setRemovingDocId(documentId);
    try {
      await api.removeDocumentFromChat(chat._id, documentId);
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      setChat((prev) =>
        prev
          ? {
              ...prev,
              document_ids: prev.document_ids.filter((id) => id !== documentId),
            }
          : prev
      );
      // Adjust current index if needed
      if (index <= currentDocIndex && currentDocIndex > 0) {
        setCurrentDocIndex((prev) => prev - 1);
      }
      setPageNumber(1);
      toast.success("Document removed from chat");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove document");
    } finally {
      setRemovingDocId(null);
    }
  };

  const switchDocument = (index: number) => {
    setCurrentDocIndex(index);
    setPageNumber(1);
    setNumPages(0);
  };

  // Filter library items to exclude documents already in the chat
  const availableLibraryItems = libraryItems.filter(
    (item) => !chat?.document_ids.includes(item.document_id)
  );

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const sendMessage = async (content: string) => {
    if (!chat) {
      toast.error("Chat not initialized");
      return;
    }

    // Optimistically add user message
    const userMessage: ChatMessage = {
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    // Add an empty assistant message that will be streamed into
    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      await api.streamMessage(
        chat._id,
        { content, role: "user" },
        (chunk) => {
          // Append each streamed token to the last (assistant) message
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            };
            return updated;
          });
        },
        undefined, // onMetadata — not displayed for now
        () => {
          setSending(false);
        },
        (error) => {
          console.error("Failed to send message:", error);
          toast.error("Failed to send message");
          // Remove the optimistic user + empty assistant messages on error
          setMessages((prev) => prev.slice(0, -2));
          setSending(false);
        }
      );
    } catch (error) {
      console.error("Stream error:", error);
      // Safety net in case the promise itself rejects
      if (sending) {
        toast.error("Failed to send message");
        setMessages((prev) => prev.slice(0, -2));
        setSending(false);
      }
    }
  };

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text.trim() || sending) return;
    sendMessage(message.text.trim());
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (sending) return;
    sendMessage(suggestion);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="size-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 h-[calc(100vh-5rem)] flex gap-4 animate-fade-in-up overflow-hidden">
      {/* Left side - Chat Interface — exactly 50% */}
      <div className="w-1/2 flex flex-col min-w-0 overflow-hidden">
        <Card className="flex-1 flex flex-col border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden py-4">
          {/* Chat Header */}
          <div className="px-4 border-b border-border/50 shrink-0">
            <h2 className="font-semibold truncate">{chat?.title || "Chat"}</h2>
            <p className="pb-2 text-sm text-muted-foreground">
              {documents.length > 0
                ? `${documents.length} document${documents.length > 1 ? "s" : ""} attached`
                : "Ask questions about your documents"}
            </p>
          </div>

          {/* Messages Area */}
          <Conversation className="flex-1 min-h-0 overflow-hidden">
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<MessageSquare className="size-12" />}
                  title="Start a conversation"
                  description="Ask questions about this document and get AI-powered answers."
                />
              ) : (
                messages.map((message) =>
                  message.role === "user" ? (
                    <Message from={message.role}>
                      <MessageContent>{message.content}</MessageContent>
                    </Message>
                  ) : (
                    <Message from={message.role}>
                      <MessageResponse>{message.content}</MessageResponse>
                    </Message>
                  )
                )
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {/* Input Area */}
          <div className="px-4 border-t border-border/50 shrink-0">
            <Suggestions className="my-4">
              {suggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  onClick={handleSuggestionClick}
                  suggestion={suggestion}
                />
              ))}
            </Suggestions>
            <PromptInput onSubmit={handleSubmit} className="w-full">
              <PromptInputTextarea
                placeholder="Ask a question about this document..."
                disabled={sending}
              />
              <PromptInputSubmit
                className="text-white bg-indigo-500 mx-4"
                disabled={sending}
              >
                {sending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </PromptInputSubmit>
            </PromptInput>
          </div>
        </Card>
      </div>

      {/* Right side - PDF Preview — exactly 50% */}
      <div className="w-1/2 flex flex-col min-w-0 overflow-hidden">
        <Card className="flex-1 flex flex-col border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden py-4">
          {/* Document Tabs & Controls */}
          <div className="px-4 border-b border-border/50 shrink-0">
            {/* Top row: title + page nav + add button */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold truncate">
                  {documents[currentDocIndex]?.title || "Document Preview"}
                </h2>
                {numPages > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Page {pageNumber} of {numPages}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {numPages > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={goToPreviousPage}
                      disabled={pageNumber <= 1}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={goToNextPage}
                      disabled={pageNumber >= numPages}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </>
                )}

                {/* Add Document Button */}
                <Dialog
                  open={addDocDialogOpen}
                  onOpenChange={(open) => {
                    setAddDocDialogOpen(open);
                    if (open) fetchLibrary();
                  }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            disabled={
                              (chat?.document_ids.length ?? 0) >= 5
                            }
                          >
                            <Plus className="size-4" />
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        {(chat?.document_ids.length ?? 0) >= 5
                          ? "Maximum 5 documents per chat"
                          : "Add document from library"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Document to Chat</DialogTitle>
                      <DialogDescription>
                        Select a document from your library to add to this
                        chat. You can have up to 5 documents per chat.
                      </DialogDescription>
                    </DialogHeader>

                    {libraryLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-6 text-indigo-500 animate-spin" />
                      </div>
                    ) : availableLibraryItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <BookOpen className="size-10 text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          {libraryItems.length === 0
                            ? "Your library is empty. Save documents first."
                            : "All library documents are already in this chat."}
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="max-h-72">
                        <div className="space-y-2 pr-3">
                          {availableLibraryItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() =>
                                handleAddDocument(item.document_id)
                              }
                              disabled={addingDocId === item.document_id}
                              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent hover:border-border transition-colors text-left disabled:opacity-50"
                            >
                              <div className="p-2 rounded-lg bg-indigo-500/10 shrink-0">
                                <FileText className="size-4 text-indigo-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {item.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.course_code} — {item.course_name}
                                </p>
                              </div>
                              {addingDocId === item.document_id ? (
                                <Loader2 className="size-4 animate-spin text-indigo-500 shrink-0" />
                              ) : (
                                <Plus className="size-4 text-muted-foreground shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Document Switcher Tabs */}
            {documents.length > 1 && (
              <div className="flex items-center gap-2 pb-2 pt-2 overflow-x-auto scrollbar-none">
                {documents.map((doc, index) => (
                  <TooltipProvider key={doc.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant={
                            index === currentDocIndex ? "default" : "outline"
                          }
                          className={`cursor-pointer shrink-0 max-w-45 gap-1.5 pr-1 transition-colors ${
                            index === currentDocIndex
                              ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                              : "hover:bg-accent"
                          }`}
                          onClick={() => switchDocument(index)}
                        >
                          <span className="truncate text-xs">
                            {doc.title}
                          </span>
                          {documents.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveDocument(doc.id, index);
                              }}
                              disabled={removingDocId === doc.id}
                              className={`rounded-full p-0.5 transition-colors ${
                                index === currentDocIndex
                                  ? "hover:bg-white/20"
                                  : "hover:bg-destructive/10 hover:text-destructive"
                              }`}
                            >
                              {removingDocId === doc.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <X className="size-3" />
                              )}
                            </button>
                          )}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{doc.title}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}

            {/* Single doc — show remove option if more than 1 doc (already shown above), otherwise just spacing */}
            {documents.length === 1 && <div className="pb-2" />}
          </div>

          {/* PDF Content — dynamic sizing */}
          <div
            ref={pdfContainerRef}
            className="flex-1 min-h-0 overflow-auto flex items-start justify-center p-4 bg-muted/30"
          >
            {documents[currentDocIndex]?.url ? (
              <Document
                className="max-w-full"
                file={documents[currentDocIndex].url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-8 text-indigo-500 animate-spin" />
                  </div>
                }
                error={
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Failed to load PDF</p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={pdfWidth}
                  className="shadow-lg"
                />
              </Document>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No document available</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ChatsPage;
