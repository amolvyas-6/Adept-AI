const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

type APIResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
};

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "API request failed");
  }
  return data.data;
}

export const api = {
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
};
