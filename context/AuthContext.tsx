"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"

interface AuthUser {
  id: string
  email: string
  firstname: string
  lastname: string
  username: string
  profileimage?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoggedIn: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
}

interface RegisterData {
  firstname: string
  lastname: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | null>(null)

const USER_KEY = "orinket_auth_user"

function toAuthUser(u: Record<string, string>): AuthUser {
  return {
    id: u._id || u.id,
    email: u.email,
    firstname: u.firstname,
    lastname: u.lastname,
    username: u.username,
    profileimage: u.profileimage,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore from localStorage while we validate with server
    try {
      const stored = localStorage.getItem(USER_KEY)
      if (stored) setUser(JSON.parse(stored) as AuthUser)
    } catch {}

    // Validate cookie with server
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { success?: boolean; data?: Record<string, string> }) => {
        if (data.success && data.data) {
          const u = toAuthUser(data.data)
          setUser(u)
          localStorage.setItem(USER_KEY, JSON.stringify(u))
        } else {
          setUser(null)
          localStorage.removeItem(USER_KEY)
        }
      })
      .catch(() => {
        // network error — keep stored user
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    })
    const data = (await res.json()) as { success?: boolean; user?: Record<string, string>; message?: string }
    if (data.success && data.user) {
      const u = toAuthUser(data.user)
      setUser(u)
      localStorage.setItem(USER_KEY, JSON.stringify(u))
      return { success: true }
    }
    return { success: false, message: data.message || "Login failed" }
  }, [])

  const register = useCallback(async (form: RegisterData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    })
    const data = (await res.json()) as { success?: boolean; user?: Record<string, string>; message?: string }
    if (data.success && data.user) {
      const u = toAuthUser(data.user)
      setUser(u)
      localStorage.setItem(USER_KEY, JSON.stringify(u))
      return { success: true }
    }
    return { success: false, message: data.message || "Registration failed" }
  }, [])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { credentials: "include" }).catch(() => {})
    setUser(null)
    localStorage.removeItem(USER_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
