import { supabase } from "./supabase";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

async function getAuthToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "API request failed");
  }
  return data.data;
}

async function authFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// Types
export interface Document {
  id: string;
  title: string;
  unit?: number;
  created_at: string;
  course_id: string;
  user_id: string;
  profiles?: { full_name: string };
  courses?: { name: string; code: string };
  url?: string;
}

export interface LibraryItem {
  id: string;
  saved_at: string;
  document_id: string;
  title: string;
  unit?: number;
  uploader?: string;
  course_code: string;
  course_name: string;
}

export interface ChatMessage {
  content: string;
  role: "user" | "assistant";
}

export interface Chat {
  _id: string;
  user_id: string;
  title: string;
  document_ids: string[];
  messages: ChatMessage[];
}

export interface ChatListItem {
  _id: string;
  title: string;
  document_ids: string[];
}

export interface Profile {
  user_id: string;
  full_name: string;
  dept_id: string;
  university_id: string;
}

export const api = {
  // Public endpoints
  getUniversities: async (): Promise<{ id: string; name: string }[]> => {
    const res = await fetch(`${BASE_URL}/universities`);
    return handleResponse(res);
  },

  getUniversity: async (id: string): Promise<{ id: string; name: string }> => {
    const res = await fetch(`${BASE_URL}/universities/${id}`);
    return handleResponse(res);
  },

  getDepartments: async (
    universityId?: string
  ): Promise<{ id: string; name: string }[]> => {
    const params = universityId ? `?universityId=${universityId}` : "";
    const res = await fetch(`${BASE_URL}/departments${params}`);
    return handleResponse(res);
  },

  registerUser: async (userData: {
    email: string;
    fullName: string;
    deptId: string;
    password: string;
    universityId: string;
  }) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  // Protected endpoints - Documents
  getDocuments: async (params?: {
    courseId?: string;
    search?: string;
    universityId?: string;
  }): Promise<Document[]> => {
    const searchParams = new URLSearchParams();
    if (params?.courseId) searchParams.set("courseId", params.courseId);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.universityId)
      searchParams.set("universityId", params.universityId);

    const query = searchParams.toString();
    const res = await authFetch(`/documents${query ? `?${query}` : ""}`);
    return handleResponse(res);
  },

  getDocument: async (id: string): Promise<Document> => {
    const res = await authFetch(`/documents/${id}`);
    return handleResponse(res);
  },

  uploadDocument: async (data: {
    file: File;
    title: string;
    unit: number;
    courseId: string;
  }): Promise<Document> => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const formData = new FormData();
    formData.append("document", data.file);
    formData.append("title", data.title);
    formData.append("unit", data.unit.toString());
    formData.append("courseId", data.courseId);

    const res = await fetch(`${BASE_URL}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(res);
  },

  // Protected endpoints - Library
  getLibrary: async (): Promise<LibraryItem[]> => {
    const res = await authFetch("/libraries");
    return handleResponse(res);
  },

  addToLibrary: async (documentId: string): Promise<void> => {
    const res = await authFetch(`/libraries/${documentId}`, {
      method: "POST",
    });
    return handleResponse(res);
  },

  removeFromLibrary: async (documentId: string): Promise<void> => {
    const res = await authFetch(`/libraries/${documentId}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  // Protected endpoints - Profile
  getProfile: async (userId: string): Promise<Profile> => {
    const res = await authFetch(`/profiles/${userId}`);
    return handleResponse(res);
  },

  updateProfile: async (
    userId: string,
    data: { fullName?: string; deptId?: string }
  ): Promise<Profile> => {
    const res = await authFetch(`/profiles/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Protected endpoints - Courses
  getCourses: async (
    universityId?: string
  ): Promise<{ id: string; name: string; code: string }[]> => {
    const params = universityId ? `?universityId=${universityId}` : "";
    const res = await authFetch(`/courses${params}`);
    return handleResponse(res);
  },

  // Protected endpoints - Chats
  getChats: async (): Promise<ChatListItem[]> => {
    const res = await authFetch("/chats");
    return handleResponse(res);
  },

  getChat: async (chatId: string): Promise<Chat> => {
    const res = await authFetch(`/chats/${chatId}`);
    return handleResponse(res);
  },

  createChat: async (documentId: string): Promise<Chat> => {
    const res = await authFetch(`/chats?documentId=${documentId}`, {
      method: "POST",
    });
    return handleResponse(res);
  },

  addMessageToChat: async (
    chatId: string,
    message: { content: string; role: string }
  ): Promise<ChatMessage> => {
    const res = await authFetch(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify(message),
    });
    return handleResponse(res);
  },

  addDocumentToChat: async (
    chatId: string,
    documentId: string
  ): Promise<void> => {
    const res = await authFetch(`/chats/${chatId}/documents/${documentId}`, {
      method: "POST",
    });
    return handleResponse(res);
  },

  removeDocumentFromChat: async (
    chatId: string,
    documentId: string
  ): Promise<void> => {
    const res = await authFetch(`/chats/${chatId}/documents/${documentId}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  deleteChat: async (chatId: string): Promise<void> => {
    const res = await authFetch(`/chats/${chatId}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  // Auth helpers (these use supabase client directly for auth operations)
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  getSession: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },

  logout: async () => {
    return supabase.auth.signOut();
  },

  onAuthStateChange: (
    callback: (session: { user: { id: string; email?: string } } | null) => void
  ) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },
};
