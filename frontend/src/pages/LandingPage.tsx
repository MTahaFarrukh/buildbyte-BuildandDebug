import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  Target,
  FileText,
  Map,
  MessageSquare,
  Check,
  ChevronDown,
  Menu,
  X,
  Zap,
  BarChart3,
  Rocket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTheme } from '@/context/ThemeContext'
import { Moon, Sun } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'AI Resume Analysis',
    desc: 'ATS scoring, rewrite suggestions, and one-click optimization that recruiters notice.',
  },
  {
    icon: Target,
    title: 'Job Match Engine',
    desc: 'Paste any JD. See match %, missing skills, and exactly what to fix before applying.',
  },
  {
    icon: Map,
    title: 'Personalized Roadmaps',
    desc: 'Week-by-week paths for AI, Full Stack, DevOps, Cybersecurity, and more.',
  },
  {
    icon: MessageSquare,
    title: 'Career Mentor Chat',
    desc: 'A mentor that remembers your goals — not another generic chatbot.',
  },
  {
    icon: Rocket,
    title: 'Project Generator',
    desc: 'Portfolio projects with architecture, timelines, and GitHub tips by skill level.',
  },
  {
    icon: BarChart3,
    title: 'Career Analytics',
    desc: 'Track confidence score, learning hours, skills completed, and weekly AI insights.',
  },
]

const testimonials = [
  {
    name: 'Aisha R.',
    role: 'CS Student → SWE Intern',
    quote:
      'CareerGPS showed me exactly which skills I was missing. I landed my first internship in 8 weeks.',
  },
  {
    name: 'Marcus T.',
    role: 'Career Switcher',
    quote:
      'The resume vs JD matcher is unfairly good. My applications finally started getting replies.',
  },
  {
    name: 'Priya K.',
    role: 'Junior Data Analyst',
    quote:
      'The roadmap + mentor chat kept me accountable. It feels like having a personal career coach.',
  },
]

const faqs = [
  {
    q: 'Is CareerGPS AI free?',
    a: 'Yes — the hackathon edition is fully free. Connect your Groq API key for live AI responses.',
  },
  {
    q: 'Do I need coding experience?',
    a: 'No. Whether you are a beginner or early professional, roadmaps adapt to your level.',
  },
  {
    q: 'What AI model do you use?',
    a: 'Llama 3.3 70B via Groq for fast, structured career guidance.',
  },
  {
    q: 'Is my resume data safe?',
    a: 'Resumes can be stored in your Supabase project. Demo mode keeps data in local memory only.',
  },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="mesh-bg min-h-screen">
      <div className="grid-overlay pointer-events-none fixed inset-0 opacity-40" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">CareerGPS AI</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
              FAQ
            </a>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="space-y-2 border-t border-border px-4 py-4 md:hidden">
            <a href="#features" className="block py-2 text-sm" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <Button className="w-full" onClick={() => navigate('/signup')}>
              Get started
            </Button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary"
          >
            <Zap className="h-3.5 w-3.5" />
            AI Career Mentor for Students & Young Professionals
          </motion.div>
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="gradient-text">CareerGPS AI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Know exactly what skills companies want, how competitive your resume is, and the roadmap
            to get hired — powered by Llama 3.3 70B.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/signup')}>
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              View demo login
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Career Score', value: '78', sub: '+12 this month' },
                { label: 'Resume ATS', value: '84%', sub: 'Interview ready' },
                { label: 'Roadmap', value: '42%', sub: 'Week 6 of 24' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="rounded-2xl border border-border bg-muted/40 p-5"
                >
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold gradient-text">{stat.value}</p>
                  <p className="mt-1 text-xs text-accent">{stat.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to get hired</h2>
          <p className="mt-3 text-muted-foreground">
            From resume to interview — one premium workspace.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full border-border/80 bg-card/60 transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold">Loved by ambitious builders</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="bg-card/70">
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">"{t.quote}"</p>
                <div className="mt-5">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Simple pricing</h2>
          <p className="mt-2 text-muted-foreground">Free during the hackathon. No credit card.</p>
        </div>
        <Card className="relative mx-auto mt-12 max-w-md overflow-hidden border-primary/40 bg-gradient-to-b from-primary/10 to-card">
          <div className="absolute right-4 top-4 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
            Free
          </div>
          <CardContent className="p-8">
            <h3 className="text-xl font-bold">CareerGPS Free</h3>
            <p className="mt-1 text-4xl font-extrabold">
              $0<span className="text-base font-normal text-muted-foreground">/forever</span>
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Resume analysis & ATS rewrite',
                'Job description matcher',
                'Career roadmaps & projects',
                'Interview prep + AI mentor',
                'Analytics & weekly insights',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent" /> {item}
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" size="lg" onClick={() => navigate('/signup')}>
              Claim free access
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold">FAQ</h2>
        <div className="mt-10 space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="rounded-2xl border border-border bg-card/60">
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {faq.q}
                <ChevronDown
                  className={`h-4 w-4 transition ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <p className="px-5 pb-4 text-sm text-muted-foreground">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 px-8 py-16 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to navigate your career?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Join students and young professionals using CareerGPS AI to become job-ready faster.
          </p>
          <Button size="lg" className="mt-8" onClick={() => navigate('/signup')}>
            Launch CareerGPS <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">CareerGPS AI</p>
        <p className="mt-1">Your AI Career Mentor for Students & Young Professionals.</p>
        <p className="mt-4">© {new Date().getFullYear()} CareerGPS AI · Team BuildandDebug · Built for BuildByte Hackathon.</p>
      </footer>
    </div>
  )
}
