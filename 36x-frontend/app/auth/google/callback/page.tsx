"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { validateGoogleCallback, refreshToken, setStoredToken } from "@/lib/auth"
import { MEDUSA_URL, MEDUSA_PUBLISHABLE_KEY } from "@/lib/env"
import { useAuth } from "@/lib/store/auth"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refresh } = useAuth()
  const [status, setStatus] = useState<"loading" | "error">("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handle = async () => {
      try {
        // Collect all query params from Google
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => { params[key] = value })

        // Validate the OAuth callback with Medusa
        let token = await validateGoogleCallback(params)

        // Decode to check if actor_id exists (customer registered)
        const payload = JSON.parse(atob(token.split(".")[1]))
        if (!payload.actor_id) {
          // New customer — create their profile then refresh token
          await fetch(`${MEDUSA_URL}/store/customers`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: payload.email ?? "" }),
          })
          token = await refreshToken(token)
        }

        setStoredToken(token)
        await refresh()
        router.replace("/my-account")
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Authentication failed")
        setStatus("error")
      }
    }
    handle()
  }, [searchParams, refresh, router])

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#0e0f11] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => router.replace("/")}
          className="border border-white/15 rounded-lg px-4 py-2 text-sm hover:border-white/30 transition"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-zinc-500">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
