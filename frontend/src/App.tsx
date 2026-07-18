import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import DashboardPage from '@/pages/DashboardPage'
import ResumePage from '@/pages/ResumePage'
import JobMatchPage from '@/pages/JobMatchPage'
import RoadmapPage from '@/pages/RoadmapPage'
import ProjectsPage from '@/pages/ProjectsPage'
import InterviewPage from '@/pages/InterviewPage'
import SkillsPage from '@/pages/SkillsPage'
import PlannerPage from '@/pages/PlannerPage'
import ChatPage from '@/pages/ChatPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import SettingsPage from '@/pages/SettingsPage'
import ToolsPage from '@/pages/ToolsPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="resume" element={<ResumePage />} />
                <Route path="job-match" element={<JobMatchPage />} />
                <Route path="roadmap" element={<RoadmapPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="interview" element={<InterviewPage />} />
                <Route path="skills" element={<SkillsPage />} />
                <Route path="planner" element={<PlannerPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="tools" element={<ToolsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<LandingPage />} />
          </Routes>
          <Toaster
            position="top-right"
            theme="system"
            richColors
            closeButton
            toastOptions={{ className: 'font-sans' }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
