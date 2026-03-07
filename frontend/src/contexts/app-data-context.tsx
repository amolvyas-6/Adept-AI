import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  api,
  type Document,
  type LibraryItem,
  type ChatListItem,
} from "@/lib/api";
import { useAuth } from "./auth-context";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface University {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  abbreviation: string;
}

interface AppDataContextValue {
  documents: Document[];
  library: LibraryItem[];
  libraryDocIds: Set<string>;
  courses: Course[];
  university: University | null;
  departments: Department[];
  chats: ChatListItem[];

  documentsLoading: boolean;
  libraryLoading: boolean;
  coursesLoading: boolean;
  chatsLoading: boolean;
  initialLoading: boolean;

  refreshDocuments: () => Promise<void>;
  refreshLibrary: () => Promise<void>;
  refreshCourses: () => Promise<void>;
  refreshChats: () => Promise<void>;

  addToLibrary: (documentId: string) => Promise<void>;
  removeFromLibrary: (documentId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const universityId = profile?.university_id;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [university, setUniversity] = useState<University | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [chats, setChats] = useState<ChatListItem[]>([]);

  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const libraryDocIds = new Set(library.map((item) => item.document_id));

  const refreshDocuments = useCallback(async () => {
    if (!universityId) return;
    setDocumentsLoading(true);
    try {
      const data = await api.getDocuments({ universityId });
      setDocuments(data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setDocumentsLoading(false);
    }
  }, [universityId]);

  const refreshLibrary = useCallback(async () => {
    setLibraryLoading(true);
    try {
      const data = await api.getLibrary();
      setLibrary(data);
    } catch (error) {
      console.error("Failed to fetch library:", error);
    } finally {
      setLibraryLoading(false);
    }
  }, []);

  const refreshCourses = useCallback(async () => {
    if (!universityId) return;
    setCoursesLoading(true);
    try {
      const data = await api.getCourses(universityId);
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setCoursesLoading(false);
    }
  }, [universityId]);

  const refreshChats = useCallback(async () => {
    setChatsLoading(true);
    try {
      const data = await api.getChats();
      setChats(data);
    } catch {
      // silently fail
    } finally {
      setChatsLoading(false);
    }
  }, []);

  const addToLibrary = useCallback(
    async (documentId: string) => {
      await api.addToLibrary(documentId);
      await refreshLibrary();
    },
    [refreshLibrary]
  );

  const removeFromLibrary = useCallback(async (documentId: string) => {
    await api.removeFromLibrary(documentId);
    setLibrary((prev) =>
      prev.filter((item) => item.document_id !== documentId)
    );
  }, []);

  const deleteChat = useCallback(async (chatId: string) => {
    await api.deleteChat(chatId);
    setChats((prev) => prev.filter((c) => c._id !== chatId));
  }, []);

  useEffect(() => {
    if (!universityId) return;

    let cancelled = false;

    const loadAll = async () => {
      setInitialLoading(true);

      const [uniData, deptData] = await Promise.all([
        api.getUniversity(universityId).catch(() => null),
        api.getDepartments(universityId).catch(() => [] as Department[]),
      ]);
      if (cancelled) return;
      setUniversity(uniData);
      setDepartments(deptData);

      await Promise.all([
        refreshDocuments(),
        refreshLibrary(),
        refreshCourses(),
        refreshChats(),
      ]);

      if (!cancelled) setInitialLoading(false);
    };

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [
    universityId,
    refreshDocuments,
    refreshLibrary,
    refreshCourses,
    refreshChats,
  ]);

  return (
    <AppDataContext.Provider
      value={{
        documents,
        library,
        libraryDocIds,
        courses,
        university,
        departments,
        chats,
        documentsLoading,
        libraryLoading,
        coursesLoading,
        chatsLoading,
        initialLoading,
        refreshDocuments,
        refreshLibrary,
        refreshCourses,
        refreshChats,
        addToLibrary,
        removeFromLibrary,
        deleteChat,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return ctx;
}
