"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import type { MedusaCustomer } from "@/lib/auth"
import {
  loginCustomer,
  registerCustomer,
  getCustomer,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
} from "@/lib/auth"

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

type AuthState = {
  customer: MedusaCustomer | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  /** Sign in with email + password */
  login: (email: string, password: string) => Promise<void>
  /** Register new account */
  register: (payload: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone?: string
  }) => Promise<void>
  logout: () => void
  /** Re-fetch customer (e.g. after profile update) */
  refresh: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthState | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<MedusaCustomer | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ── Hydrate from localStorage on mount ──────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const stored = getStoredToken()
      if (!stored) {
        setIsLoading(false)
        return
      }
      try {
        const cust = await getCustomer(stored)
        setToken(stored)
        setCustomer(cust)
      } catch {
        // Token expired or invalid
        clearStoredToken()
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  // ── Actions ─────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const t = await loginCustomer(email, password)
      const cust = await getCustomer(t)
      setStoredToken(t)
      setToken(t)
      setCustomer(cust)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(
    async (payload: {
      email: string
      password: string
      first_name: string
      last_name: string
      phone?: string
    }) => {
      setIsLoading(true)
      try {
        const t = await registerCustomer(payload)
        const cust = await getCustomer(t)
        setStoredToken(t)
        setToken(t)
        setCustomer(cust)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const logout = useCallback(() => {
    clearStoredToken()
    setToken(null)
    setCustomer(null)
  }, [])

  const refresh = useCallback(async () => {
    if (!token) return
    try {
      const cust = await getCustomer(token)
      setCustomer(cust)
    } catch {
      logout()
    }
  }, [token, logout])

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        isLoading,
        isAuthenticated: !!customer,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
