import { useEffect, useState, useRef } from "react";
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
  ImageIcon,
  FileTextIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  type SourceMetadata,
} from "@/lib/api";
import { useAppData } from "@/contexts/app-data-context";
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
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
} from "@/components/ai-elements/sources";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const { library: contextLibrary, libraryLoading: contextLibraryLoading } =
    useAppData();
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

      // Fetch all documents associated with this chat
      const docPromises = chatData.document_ids.map((docId) =>
        api.getDocument(docId)
      );
      const docs = await Promise.all(docPromises);
      setDocuments(docs);

      // Process messages: merge metadata-role messages into preceding assistant messages
      const rawMessages = (chatData.messages || []) as Array<{
        content: string | object[];
        role: string;
      }>;
      const processedMessages: ChatMessage[] = [];
      for (const msg of rawMessages) {
        if (msg.role === "metadata") {
          const lastAssistant = [...processedMessages]
            .reverse()
            .find((m) => m.role === "assistant");
          if (lastAssistant) {
            lastAssistant.sources = Array.isArray(msg.content)
              ? (msg.content as unknown as SourceMetadata[])
              : [];
          }
        } else {
          processedMessages.push({
            content: typeof msg.content === "string" ? msg.content : "",
            role: msg.role as "user" | "assistant",
          });
        }
      }
      setMessages(processedMessages);
    } catch (error) {
      console.error("Failed to load chat:", error);
      toast.error("Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  // Filter library items to exclude documents already in the chat
  const availableLibraryItems = contextLibrary.filter(
    (item) => !chat?.document_ids.includes(item.document_id)
  );

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
        (metadata: SourceMetadata[]) => {
          // Deduplicate sources by docId + page
          const seen = new Set<string>();
          const unique = metadata.filter((m) => {
            const key = `${m.docId}-${m.page}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
              ...last,
              sources: unique,
            };
            return updated;
          });
        },
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

  const handleSourceClick = (source: SourceMetadata) => {
    if (!source.docId) return;
    const docIndex = documents.findIndex((doc) => doc.id === source.docId);
    if (docIndex !== -1) {
      if (docIndex !== currentDocIndex) {
        setCurrentDocIndex(docIndex);
        setNumPages(0);
      }
      // pymupdf pages are 0-indexed, react-pdf is 1-indexed
      setPageNumber(source.page + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-32 h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 min-h-0 flex gap-6 overflow-hidden h-full p-6"
    >
      {/* Left side - Chat Interface */}
      <div className="w-1/2 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 flex flex-col border border-white/5 bg-surface-container-highest/20 backdrop-blur-xl overflow-hidden rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-white/5 shrink-0 flex items-center justify-between bg-surface-container-low/50">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-surface-container-highest border border-white/5">
                <MessageSquare className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-base truncate leading-tight">{chat?.title || "Neural Session"}</h2>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                  {documents.length > 0
                    ? `${documents.length} context node${documents.length > 1 ? "s" : ""} active`
                    : "Awaiting context nodes"}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <Conversation className="flex-1 min-h-0 overflow-hidden bg-transparent">
            <ConversationContent className="px-6 pt-6">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<MessageSquare className="size-10 text-primary-dim" />}
                  title="Initialize Sequence"
                  description="Query the active context nodes for extracted insights."
                  className="bg-transparent border-none"
                />
              ) : (
                messages.map((message, index) =>
                  message.role === "user" ? (
                    <Message key={index} from={message.role} className="mb-6">
                      <MessageContent className="bg-surface-container-highest border-white/5 text-foreground rounded-2xl shadow-sm text-base leading-relaxed">{message.content}</MessageContent>
                    </Message>
                  ) : (
                    <Message key={index} from={message.role} className="mb-6">
                      <MessageResponse className="text-foreground/90 text-base leading-relaxed">{message.content}</MessageResponse>
                      {message.sources && message.sources.length > 0 && (
                        <Sources className="mt-4">
                          <SourcesTrigger count={message.sources.length} className="bg-surface-container-low border-white/5 text-primary-dim hover:text-primary" />
                          <SourcesContent className="bg-surface-container-highest border-white/5 backdrop-blur-xl rounded-xl">
                            {message.sources.map((source, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSourceClick(source)}
                                className="flex items-center gap-3 p-2 cursor-pointer text-sm font-medium hover:bg-surface-container-low transition-colors text-left rounded-lg border border-transparent hover:border-white/5 w-full"
                              >
                                {source.type === "image" ? (
                                  <ImageIcon className="size-4 text-amber-500 shrink-0" />
                                ) : (
                                  <FileTextIcon className="size-4 text-primary-dim shrink-0" />
                                )}
                                <span className="flex-1 truncate">{source.source}</span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-2 py-0.5 border-white/10 bg-surface-container-low"
                                >
                                  p.{source.page + 1}
                                </Badge>
                              </button>
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}
                    </Message>
                  )
                )
              )}
            </ConversationContent>
            <ConversationScrollButton className="bg-surface-container-highest border-white/5 hover:bg-surface-container-low" />
          </Conversation>

          {/* Input Area */}
          <div className="p-6 pt-2 shrink-0 bg-surface-container-low/50 backdrop-blur-md">
            <Suggestions className="mb-4 gap-2 flex-wrap">
              {suggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  onClick={handleSuggestionClick}
                  suggestion={suggestion}
                  className="bg-surface-container-highest/50 border-white/5 hover:bg-surface-container-highest hover:border-primary/30 text-sm py-1.5 rounded-full transition-all"
                />
              ))}
            </Suggestions>
            <PromptInput onSubmit={handleSubmit} className="w-full bg-surface-container-highest/80 border-white/10 shadow-inner rounded-2xl">
              <PromptInputTextarea
                placeholder="Query context..."
                disabled={sending}
                className="placeholder:text-muted-foreground/50 py-4 text-base"
              />
              <PromptInputSubmit
                className="text-primary-foreground bg-primary hover:bg-primary-dim mx-3 mb-3 rounded-xl size-10 shadow-[0_0_15px_rgba(96,99,238,0.3)] transition-all"
                disabled={sending}
              >
                {sending ? (
                  <Loader2 className="size-4 animate-spin text-primary-foreground" />
                ) : (
                  <Send className="size-4" />
                )}
              </PromptInputSubmit>
            </PromptInput>
          </div>
        </div>
      </div>

      {/* Right side - PDF Preview */}
      <div className="w-1/2 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 flex flex-col border border-white/5 bg-surface-container-low overflow-hidden rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          {/* Document Tabs & Controls */}
          <div className="px-4 py-3 border-b border-white/5 shrink-0 bg-surface-container-highest/30">
            {/* Top row: title + page nav + add button */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="min-w-0 flex-1 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface-container-highest border border-white/5">
                  <FileText className="size-4 text-primary-dim" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold truncate text-base">
                    {documents[currentDocIndex]?.title || "Context Viewer"}
                  </h2>
                  {numPages > 0 && (
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                      Page {pageNumber} / {numPages}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 bg-surface-container-highest p-1 rounded-xl border border-white/5">
                {numPages > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={goToPreviousPage}
                      disabled={pageNumber <= 1}
                      className="hover:bg-surface-container-low rounded-lg size-8 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <div className="w-px h-4 bg-white/10" />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={goToNextPage}
                      disabled={pageNumber >= numPages}
                      className="hover:bg-surface-container-low rounded-lg size-8 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                    <div className="w-px h-4 bg-white/10" />
                  </>
                )}

                {/* Add Document Button */}
                <Dialog
                  open={addDocDialogOpen}
                  onOpenChange={setAddDocDialogOpen}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={(chat?.document_ids.length ?? 0) >= 5}
                            className="hover:bg-primary-dim/20 hover:text-primary text-muted-foreground rounded-lg size-8 transition-colors"
                          >
                            <Plus className="size-4" />
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="bg-surface-container-highest border-white/5">
                        {(chat?.document_ids.length ?? 0) >= 5
                          ? "Maximum 5 documents per chat"
                          : "Add context node"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DialogContent className="sm:max-w-md bg-surface-container-highest border-white/5 backdrop-blur-xl">
                    <DialogHeader>
                      <DialogTitle>Add Context Node</DialogTitle>
                      <DialogDescription>
                        Select a document from your library to attach to this session.
                        (Max 5 nodes)
                      </DialogDescription>
                    </DialogHeader>

                    {contextLibraryLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-16 h-1 bg-surface-container-low rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-1/2 animate-[pulse_1s_ease-in-out_infinite]" />
                        </div>
                      </div>
                    ) : availableLibraryItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="size-16 rounded-2xl bg-surface-container-low border border-white/5 flex items-center justify-center mb-4">
                          <BookOpen className="size-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {contextLibrary.length === 0
                            ? "Library empty. Acquire context first."
                            : "All available nodes connected."}
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="max-h-72">
                        <div className="space-y-2 pr-3">
                          {availableLibraryItems.map((item) => (
                            <button
                              key={item.document_id}
                              onClick={() =>
                                handleAddDocument(item.document_id)
                              }
                              disabled={addingDocId === item.document_id}
                              className="w-full flex items-center gap-4 p-3 rounded-xl border border-white/5 hover:bg-surface-container-low hover:border-white/10 transition-all text-left disabled:opacity-50 group"
                            >
                              <div className="p-2.5 rounded-lg bg-surface-container-highest border border-white/5 shrink-0 group-hover:scale-110 transition-transform">
                                <FileText className="size-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {item.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                                  {item.course_code}
                                </p>
                              </div>
                              {addingDocId === item.document_id ? (
                                <Loader2 className="size-4 animate-spin text-primary shrink-0" />
                              ) : (
                                <Plus className="size-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
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
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2">
                <AnimatePresence>
                  {documents.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className={cn(
                                "cursor-pointer shrink-0 max-w-[180px] gap-2 pr-1.5 py-1.5 transition-all border-white/5",
                                index === currentDocIndex
                                  ? "bg-surface-container-highest border-primary/30 text-foreground shadow-sm"
                                  : "bg-transparent text-muted-foreground hover:bg-surface-container-highest hover:text-foreground"
                              )}
                              onClick={() => switchDocument(index)}
                            >
                              <div className={cn("size-1.5 rounded-full", index === currentDocIndex ? "bg-primary animate-pulse" : "bg-white/20")} />
                              <span className="truncate text-xs font-medium">{doc.title}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveDocument(doc.id, index);
                                }}
                                disabled={removingDocId === doc.id}
                                className={cn(
                                  "rounded-md p-1 transition-colors ml-1",
                                  index === currentDocIndex
                                    ? "hover:bg-white/10 text-muted-foreground hover:text-foreground"
                                    : "hover:bg-destructive/20 hover:text-destructive"
                                )}
                              >
                                {removingDocId === doc.id ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <X className="size-3" />
                                )}
                              </button>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="bg-surface-container-highest border-white/5">{doc.title}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* PDF Content */}
          <div
            ref={pdfContainerRef}
            className="flex-1 min-h-0 overflow-auto flex items-start justify-center p-6 bg-surface-container-low/50 relative"
          >
            {/* Soft inner shadow for depth */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] z-10" />
            
            {documents[currentDocIndex]?.url ? (
              <Document
                className="max-w-full relative z-0"
                file={documents[currentDocIndex].url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-1/2 animate-[pulse_1s_ease-in-out_infinite]" />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Loading Context</p>
                  </div>
                }
                error={
                  <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-3">
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                      <X className="size-6" />
                    </div>
                    <p className="text-sm font-medium">Context unreadable</p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={pdfWidth}
                  className="shadow-[0_0_40px_rgba(0,0,0,0.3)] rounded-sm overflow-hidden border border-white/10"
                />
              </Document>
            ) : (
              <div className="text-center py-20 text-muted-foreground flex flex-col items-center justify-center h-full gap-4">
                <div className="size-16 rounded-2xl bg-surface-container-highest border border-white/5 flex items-center justify-center">
                  <FileText className="size-8 text-white/10" />
                </div>
                <p className="text-sm font-medium uppercase tracking-widest">No Context Node</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ChatsPage;