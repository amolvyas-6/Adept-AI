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

export interface Profile {
  user_id: string;
  full_name: string;
  dept_id: string;
}

export const api = {
  // Public endpoints
  getDepartments: async (): Promise<{ id: string; name: string }[]> => {
    const res = await fetch(`${BASE_URL}/departments`);
    return handleResponse(res);
  },

  registerUser: async (userData: {
    email: string;
    fullName: string;
    deptId: string;
    password: string;
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
  }): Promise<Document[]> => {
    const searchParams = new URLSearchParams();
    if (params?.courseId) searchParams.set("courseId", params.courseId);
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    const res = await authFetch(`/documents${query ? `?${query}` : ""}`);
    return handleResponse(res);
  },

  getDocument: async (id: string): Promise<Document> => {
    const res = await authFetch(`/documents/${id}`);
    return handleResponse(res);
  },

  // Protected endpoints - Library
  getLibrary: async (): Promise<LibraryItem[]> => {
    const res = await authFetch("/libraries");
    return handleResponse(res);
  },

  addToLibrary: async (documentId: string): Promise<void> => {
    const res = await authFetch("/libraries", {
      method: "POST",
      body: JSON.stringify({ documentId }),
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
  getCourses: async (): Promise<
    { id: string; name: string; code: string }[]
  > => {
    const res = await authFetch("/courses");
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
