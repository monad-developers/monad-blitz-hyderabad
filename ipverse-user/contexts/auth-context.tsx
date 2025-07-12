"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  kycStatus?: string
  walletBalance?: number
  totalInvestments?: number
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean, message?: string }>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("Checking initial authentication state")
    // Check for stored user and token on mount
    try {
      const storedUser = localStorage.getItem("ipverse-user")
      const token = localStorage.getItem("ipverse-token")
      console.log("Stored auth state:", { hasUser: !!storedUser, hasToken: !!token })

      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser)
          console.log("Successfully parsed stored user data")
          setUser(parsedUser)
        } catch (parseError) {
          console.error("Failed to parse stored user data:", parseError)
          localStorage.removeItem("ipverse-user")
          localStorage.removeItem("ipverse-token")
          setUser(null)
        }
      } else {
        console.log("Incomplete auth state, clearing data")
        // Clear incomplete auth state
        localStorage.removeItem("ipverse-user")
        localStorage.removeItem("ipverse-token")
        setUser(null)
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
      // Clear potentially corrupted data
      try {
        localStorage.removeItem("ipverse-user")
        localStorage.removeItem("ipverse-token")
      } catch (clearError) {
        console.error("Failed to clear corrupted data:", clearError)
      }
      setUser(null)
    } finally {
      setIsLoading(false)
      console.log("Finished checking authentication state")
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean, message?: string }> => {
    try {
      console.log("Attempting login for:", email)
      const res = await fetch("http://localhost:5000/api/user/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const result = await res.json()
      console.log("result is here",result);
      console.log("Login response:", { ok: res.ok, success: result.success, hasUser: !!result.data?.user, hasToken: !!result.token })

      if (res.ok && result.success ) {
        const user = result.data?.user
        console.log("Setting user and token in state/storage",user);
        try {
          localStorage.setItem("ipverse-user", JSON.stringify(user))
          localStorage.setItem("ipverse-token", result.data?.token)
          console.log("Successfully stored auth data")
          setUser(user)
          return { success: true }
        } catch (storageError) {
          console.error("Failed to store auth data:", storageError)
          return { success: false, message: "Failed to store authentication data. Please try again." }
        }
      } else {
        console.warn("Login failed:", result.message || "Unknown error")
        return { success: false, message: result.message || "Login failed. Please try again." }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Login failed. Please try again." }
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:5000/api/user/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await res.json();
      console.log("Signup API result:", result);
      
      if (res.ok && result.success) {
        console.log("Registration successful, data:", result.data);
        if (result.data?.user && result.data?.token) {
          const user = result.data.user;
          console.log("Storing user data:", user);
          console.log("Storing token:", result.data?.token);
          try {
            localStorage.setItem("ipverse-user", JSON.stringify(user));
            localStorage.setItem("ipverse-token", result.data?.token);
            setUser(user);
            return true;
          } catch (storageError) {
            console.error("Failed to store auth data:", storageError);
            return false;
          }
        } else {
          console.error("Missing user data or token in response");
          return false;
        }
      } else {
        console.error("Registration failed:", result.message || "Unknown error");
        return false;
      }
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem("ipverse-user")
      localStorage.removeItem("ipverse-token")
    } catch (error) {
      console.error("Error removing user from localStorage:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
