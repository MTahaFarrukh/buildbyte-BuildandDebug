import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi, dashboardApi } from '@/lib/api'
import { toast } from 'sonner'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  career_path?: string
  career_score?: number
  theme?: string
  badges?: string[]
  skills?: string[]
  completed_skills?: string[]
  learning_hours?: number
  projects_built?: number
  weekly_goal?: string
  roadmap_progress?: number
  upcoming_tasks?: { id: string; title: string; due: string; done: boolean }[]
  recommended_skills?: string[]
  weekly_activity?: { day: string; hours: number }[]
  analytics?: Record<string, unknown>
  notifications_enabled?: boolean
  bio?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  resume_improvements?: number
}

interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string, careerPath?: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  updateLocalProfile: (patch: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_TOKEN = 'careergps_token'
const STORAGE_USER = 'careergps_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    const stored = localStorage.getItem(STORAGE_USER)
    if (!stored) return
    const parsed = JSON.parse(stored) as UserProfile
    try {
      const { data } = await dashboardApi.get(parsed.id)
      const profile = data.dashboard as UserProfile
      setUser(profile)
      localStorage.setItem(STORAGE_USER, JSON.stringify(profile))
    } catch {
      setUser(parsed)
    }
  }, [])

  useEffect(() => {
    const t = localStorage.getItem(STORAGE_TOKEN)
    const u = localStorage.getItem(STORAGE_USER)
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
      refreshProfile().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [refreshProfile])

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password })
    const profile: UserProfile = {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.full_name || email.split('@')[0],
    }
    localStorage.setItem(STORAGE_TOKEN, data.access_token)
    localStorage.setItem(STORAGE_USER, JSON.stringify(profile))
    setToken(data.access_token)
    setUser(profile)
    await refreshProfile()
    toast.success('Welcome back!')
  }

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    careerPath?: string,
  ) => {
    const { data } = await authApi.signup({
      email,
      password,
      full_name: fullName,
      career_path: careerPath,
    })
    const profile: UserProfile = {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.full_name || fullName,
      career_path: careerPath,
    }
    if (data.access_token) {
      localStorage.setItem(STORAGE_TOKEN, data.access_token)
      setToken(data.access_token)
    }
    localStorage.setItem(STORAGE_USER, JSON.stringify(profile))
    setUser(profile)
    await refreshProfile()
    toast.success('Account created!')
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem(STORAGE_USER)
    setToken(null)
    setUser(null)
    toast.message('Signed out')
  }

  const updateLocalProfile = (patch: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      localStorage.setItem(STORAGE_USER, JSON.stringify(next))
      return next
    })
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
      refreshProfile,
      updateLocalProfile,
    }),
    [user, token, loading, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
