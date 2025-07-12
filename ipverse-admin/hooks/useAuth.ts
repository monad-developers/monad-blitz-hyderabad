// hooks/useAuth.ts
import { useRouter } from "next/navigation";
import { useState } from "react";

export type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    admin: {
      id: string;
      email: string;
      role: string;
      lastLogin: string;
    };
    token: string;
  };
};

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function login(email: string, password: string) {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data: LoginResponse = await res.json();
    console.log("data is here in useauth fuiled:",data);
    setLoading(false);

    if (data.success && data.data) {
      localStorage.setItem("token", data.data.token); // Prefer cookies in production!
      localStorage.setItem("admin", JSON.stringify(data.data.admin));
      router.push("/dashboard");
      return data;
    } else {
      throw new Error(data.message || "Login failed");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    router.push("/login");
  }

  return { login, logout, loading };
}