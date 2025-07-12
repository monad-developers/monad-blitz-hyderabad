const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  // Don't set Content-Type for FormData, let the browser handle it
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    try {
      const error = await res.json();
      throw new Error(error.message || "API Error");
    } catch (e) {
      throw new Error("Network or server error");
    }
  }

  try {
    return await res.json();
  } catch (e) {
    throw new Error("Invalid JSON response from server");
  }
}
