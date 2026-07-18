import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const run = async () => {
      if (!supabase) {
        navigate('/login')
        return
      }
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        toast.error('Google authentication failed')
        navigate('/login')
        return
      }
      const user = data.session.user
      const profile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      }
      localStorage.setItem('careergps_token', data.session.access_token)
      localStorage.setItem('careergps_user', JSON.stringify(profile))
      toast.success('Signed in with Google')
      navigate('/app')
      window.location.reload()
    }
    run()
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center mesh-bg">
      <div className="text-center">
        <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
        <p className="text-sm text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  )
}
