import { toast } from "sonner";

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  totalInvestments: number;
  walletBalance: number;
  kycStatus: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  phone?: string;
  location?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  images?: string[]; // Add this line to support multiple images
  category: string;
  totalTokens: number;
  availableTokens: number;
  minInvestment: number;
  expectedReturn: string;
  companyId: string;
  details: {
    launchDate: string;
    duration: string;
    totalRaised: string;
    investors: number;
    riskLevel: string;
    highlights: string[];
  };
  status: string;
  startDate: string;
  endDate: string;
  createdBy: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "API Error");
    }

    return res.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    toast.error(message);
    throw error;
  }
}

// User related API calls
export const userApi = {
  getProfile: () => apiFetch<UserProfile>("/user/auth/profile"),
  updateProfile: (data: Partial<UserProfile>) =>
    apiFetch<UserProfile>("/user/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Project related API calls
export const projectApi = {
  getAllProjects: () => apiFetch<Project[]>("/user/browse/projects"),
  getProjectById: (id: string) => apiFetch<Project>(`/user/browse/projects/${id}`),
  investInProject: (projectId: string, tokenAmount: number) =>
    apiFetch<{ success: boolean }>(`/user/projects/${projectId}/invest`, {
      method: "POST",
      body: JSON.stringify({ tokenAmount }),
    }),
};