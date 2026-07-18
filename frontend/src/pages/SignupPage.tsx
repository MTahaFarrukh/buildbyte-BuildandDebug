import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { signInWithGoogle, supabaseConfigured } from '@/lib/supabase'
import { toast } from 'sonner'

type Form = {
  full_name: string
  email: string
  password: string
  career_path: string
}

const paths = [
  'AI Engineer',
  'Data Scientist',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Cybersecurity Analyst',
  'DevOps Engineer',
  'Mobile Developer',
  'Product Manager',
]

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    defaultValues: { career_path: 'Full Stack Developer' },
  })

  const onSubmit = async (data: Form) => {
    setLoading(true)
    try {
      await signup(data.email, data.password, data.full_name, data.career_path)
      navigate('/app')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">CareerGPS AI</span>
        </Link>
        <Card className="border-border/80 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Start your personalized career journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input placeholder="Alex Chen" {...register('full_name', { required: true })} />
                {errors.full_name && <p className="text-xs text-destructive">Name is required</p>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@email.com" {...register('email', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Min 6 characters"
                  {...register('password', { required: true, minLength: 6 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Target career path</Label>
                <select
                  className="flex h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  {...register('career_path')}
                >
                  {paths.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signInWithGoogle().catch((e) => toast.error(e.message))}
              disabled={!supabaseConfigured}
            >
              Continue with Google
            </Button>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
