import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('careergps_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  signup: (data: { email: string; password: string; full_name: string; career_path?: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
}

export const resumeApi = {
  upload: (file: File, userId: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('user_id', userId)
    return api.post('/resume/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  analyze: (data: { resume_text?: string; resume_id?: string; target_role?: string }) =>
    api.post('/resume/analyze', data),
  rewrite: (data: { resume_text: string; target_role: string }) =>
    api.post('/resume/rewrite', data),
  list: (userId: string) => api.get(`/resume/list/${userId}`),
}

export const jobApi = {
  analyze: (data: { resume_text: string; job_description: string }) =>
    api.post('/job/analyze', data),
}

export const roadmapApi = {
  paths: () => api.get('/roadmap/paths'),
  generate: (data: {
    career_path: string
    current_level: string
    background?: string
    hours_per_week?: number
  }) => api.post('/roadmap/generate', data),
}

export const projectApi = {
  generate: (data: {
    career_path: string
    skill_level: string
    interests?: string
    count?: number
  }) => api.post('/project/generate', data),
}

export const interviewApi = {
  generate: (data: { role: string; experience_level: string; focus_areas?: string }) =>
    api.post('/interview/generate', data),
}

export const skillsApi = {
  analyze: (data: {
    current_skills: string[]
    target_role: string
    experience?: string
  }) => api.post('/skills/analyze', data),
}

export const plannerApi = {
  create: (data: {
    goal: string
    hours_per_day: number
    career_path: string
    current_skills?: string[]
    weak_areas?: string[]
  }) => api.post('/planner', data),
}

export const chatApi = {
  send: (data: {
    message: string
    chat_history: { role: string; content: string }[]
    user_context?: string
  }) => api.post('/chat', data),
}

export const dashboardApi = {
  get: (userId: string) => api.get(`/dashboard/${userId}`),
  update: (userId: string, data: Record<string, unknown>) =>
    api.patch(`/dashboard/${userId}`, data),
  updateProfile: (userId: string, data: Record<string, unknown>) =>
    api.patch(`/dashboard/profile/${userId}`, data),
  deleteAccount: (userId: string) => api.delete(`/dashboard/account/${userId}`),
}

export const bonusApi = {
  linkedin: (data: { profile_content: string; target_role: string }) =>
    api.post('/bonus/linkedin', data),
  portfolio: (data: { portfolio_content: string; career_path: string }) =>
    api.post('/bonus/portfolio', data),
  github: (data: { github_info: string; target_role: string }) =>
    api.post('/bonus/github', data),
  insights: (data: { activity_data: string; career_path: string; career_score: number }) =>
    api.post('/bonus/insights', data),
}

export default api
