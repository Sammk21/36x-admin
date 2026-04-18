"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/store/auth"
import { initiateGoogleLogin } from "@/lib/auth"

// ---------------------------------------------------------------------------
// Shared input
// ---------------------------------------------------------------------------

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === "password"

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] uppercase tracking-widest text-white/40 font-body">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body placeholder-white/20 focus:outline-none focus:border-white/30 transition pr-10"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Google sign-in button
// ---------------------------------------------------------------------------

function GoogleButton() {
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const url = await initiateGoogleLogin()
      window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-[11px] font-body uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-xs font-body hover:bg-white/10 disabled:opacity-40 transition"
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        Continue with Google
      </button>
    </>
  )
}

// ---------------------------------------------------------------------------
// Login form
// ---------------------------------------------------------------------------

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        autoComplete="current-password"
      />

      {error && (
        <p className="text-red-400 text-sm font-body text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading || !email || !password}
        className="mt-1 w-full py-3 rounded-xl bg-white text-black text-sm font-display uppercase tracking-widest hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 size={13} className="animate-spin" />}
        Sign In
      </button>

      <GoogleButton />

      <p className="text-center text-white/30 text-xs font-body">
        No account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-white/60 hover:text-white underline transition"
        >
          Register
        </button>
      </p>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Register form
// ---------------------------------------------------------------------------

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register, isLoading } = useAuth()
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await register(form)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed")
    }
  }

  const valid =
    form.first_name && form.last_name && form.email && form.password.length >= 8

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="First Name"
          value={form.first_name}
          onChange={set("first_name")}
          autoComplete="given-name"
        />
        <Field
          label="Last Name"
          value={form.last_name}
          onChange={set("last_name")}
          autoComplete="family-name"
        />
      </div>
      <Field
        label="Email"
        type="email"
        value={form.email}
        onChange={set("email")}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <Field
        label="Phone (optional)"
        type="tel"
        value={form.phone}
        onChange={set("phone")}
        placeholder="+91 98765 43210"
        autoComplete="tel"
      />
      <Field
        label="Password (min 8 chars)"
        type="password"
        value={form.password}
        onChange={set("password")}
        autoComplete="new-password"
      />

      {error && (
        <p className="text-red-400 text-sm font-body text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading || !valid}
        className="mt-1 w-full py-3 rounded-xl bg-white text-black text-sm font-display uppercase tracking-widest hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 size={13} className="animate-spin" />}
        Create Account
      </button>

      <GoogleButton />

      <p className="text-center text-white/30 text-xs font-body">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-white/60 hover:text-white underline transition"
        >
          Sign In
        </button>
      </p>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

interface AuthModalProps {
  open: boolean
  onClose: () => void
  defaultTab?: "login" | "register"
}

export default function AuthModal({
  open,
  onClose,
  defaultTab = "login",
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab)
  const { isAuthenticated } = useAuth()

  // Auto-close when auth succeeds
  if (isAuthenticated && open) {
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="auth-panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md bg-black rounded-2xl border border-white/10 shadow-2xl pointer-events-auto overflow-hidden"
            
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/30 hover:text-white transition z-10"
              >
                <X size={18} />
              </button>

              <div className="px-8 py-8">
                {/* Logo / heading */}
                <div className="mb-6 text-center">
                  <p className="text-3xl font-display uppercase  text-white">
                    {tab === "login" ? "Welcome Back" : "Join 36X"}
                  </p>
                  <p className="text-white/30 text-sm font-body mt-1">
                    {tab === "login"
                      ? "Sign in to your account"
                      : "Create your account"}
                  </p>
                </div>

                {/* Tab toggle */}
                <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
                  {(["login", "register"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 py-2.5 text-md font-display uppercase  transition ${
                        tab === t
                          ? "bg-white/10 text-white"
                          : "text-white/30 hover:text-white/60"
                      }`}
                    >
                      {t === "login" ? "Sign In" : "Register"}
                    </button>
                  ))}
                </div>

                {/* Forms */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, x: tab === "login" ? -12 : 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: tab === "login" ? 12 : -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab === "login" ? (
                      <LoginForm onSwitch={() => setTab("register")} />
                    ) : (
                      <RegisterForm onSwitch={() => setTab("login")} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
