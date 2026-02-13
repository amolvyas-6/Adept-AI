import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Loader2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  api,
  type Document as DocumentType,
  type Chat,
  type ChatMessage,
} from "@/lib/api";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
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
  const suggestions = [
    "What is the main topic of this document?",
    "Summarize the key points.",
    "Explain the concepts in simple terms.",
  ];

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

    try {
      // Send message to backend and get AI response
      const aiResponse = await api.addMessageToChat(chat._id, {
        content,
        role: "user",
      });
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      // Remove the optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
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
    <div className="flex-1 max-h-[calc(100vh-5rem)] flex gap-4 animate-fade-in-up">
      {/* Left side - Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden py-4">
          {/* Chat Header */}
          <div className="px-4 border-b border-border/50">
            <h2 className="font-semibold truncate">{chat?.title || "Chat"}</h2>
            <p className="pb-2 text-sm text-muted-foreground">
              {documents.length > 0
                ? `${documents.length} document${documents.length > 1 ? "s" : ""} attached`
                : "Ask questions about your documents"}
            </p>
          </div>

          {/* Messages Area */}
          <Conversation className="flex-1">
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<MessageSquare className="size-12" />}
                  title="Start a conversation"
                  description="Ask questions about this document and get AI-powered answers."
                />
              ) : (
                messages.map((message) => (
                  <Message from={message.role}>
                    <MessageContent>{message.content}</MessageContent>
                  </Message>
                ))
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {/* Input Area */}
          <div className="px-4 border-t border-border/50">
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

      {/* Right side - PDF Preview */}
      <div className="w-1/2 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden py-4">
          {/* PDF Header */}
          <div className="px-4 border-b border-border/50 flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="font-semibold truncate">
                {documents[currentDocIndex]?.title || "Document Preview"}
              </h2>
              {numPages > 0 && (
                <p className="pb-2 text-sm text-muted-foreground">
                  Page {pageNumber} of {numPages}
                </p>
              )}
            </div>
            {numPages > 1 && (
              <div className="flex items-center justify-center gap-2">
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
              </div>
            )}
          </div>

          {/* PDF Content */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-muted/30">
            {documents[currentDocIndex]?.url ? (
              <Document
                className="max-w-full"
                file={documents[currentDocIndex].url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center py-12 w-[500px]">
                    <Loader2 className="size-8 text-indigo-500 animate-spin" />
                  </div>
                }
                error={
                  <div className="text-center py-12 text-muted-foreground w-125">
                    <p>Failed to load PDF</p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={500}
                  className="shadow-lg max-w-full"
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
