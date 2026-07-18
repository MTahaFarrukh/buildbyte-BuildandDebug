import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Bot,
  User,
  Trash2,
  Lightbulb,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/input'
import { chatApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_PROMPTS = [
  'What skills should I learn next for my career path?',
  'How can I improve my resume for ATS?',
  'Help me prepare for a technical interview this week.',
  'Suggest a portfolio project I can finish in 2 weeks.',
  'How do I negotiate my first job offer?',
]

function chatStorageKey(userId: string) {
  return `careergps_chat_${userId}`
}

function buildUserContext(user: ReturnType<typeof useAuth>['user']) {
  if (!user) return 'Student exploring career options'
  const parts = [
    `Name: ${user.full_name}`,
    user.career_path && `Career path: ${user.career_path}`,
    user.career_score != null && `Career score: ${user.career_score}`,
    user.skills?.length && `Skills: ${user.skills.join(', ')}`,
    user.weekly_goal && `Weekly goal: ${user.weekly_goal}`,
    user.bio && `Bio: ${user.bio}`,
  ].filter(Boolean)
  return parts.join('. ')
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!user?.id) return
    try {
      const stored = localStorage.getItem(chatStorageKey(user.id))
      if (stored) setMessages(JSON.parse(stored))
    } catch {
      /* ignore corrupt storage */
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    localStorage.setItem(chatStorageKey(user.id), JSON.stringify(messages))
  }, [messages, user?.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || loading) return

      const userMsg: ChatMessage = { role: 'user', content: trimmed }
      const nextHistory = [...messages, userMsg]
      setMessages(nextHistory)
      setInput('')
      setLoading(true)
      setTyping(true)
      setError(null)

      try {
        const { data } = await chatApi.send({
          message: trimmed,
          chat_history: messages.map((m) => ({ role: m.role, content: m.content })),
          user_context: buildUserContext(user),
        })
        setMessages([...nextHistory, { role: 'assistant', content: data.reply }])
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to send message'
        setError(msg)
        toast.error(msg)
        setMessages(messages)
      } finally {
        setLoading(false)
        setTyping(false)
        inputRef.current?.focus()
      }
    },
    [loading, messages, user],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearHistory = () => {
    setMessages([])
    if (user?.id) localStorage.removeItem(chatStorageKey(user.id))
    toast.message('Chat history cleared')
  }

  const retryLast = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUser) {
      setMessages(messages.filter((m) => m !== messages[messages.length - 1]))
      sendMessage(lastUser.content)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col gap-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Career Mentor</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Personalized guidance that remembers your goals and profile.
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </motion.div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-border/80 bg-card/70">
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-full flex-col items-center justify-center px-4 py-12 text-center"
              >
                <div className="relative mb-6">
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-xl" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
                    <Sparkles className="h-9 w-9 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold">Hey {user?.full_name?.split(' ')[0] || 'there'}!</h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  I'm your CareerGPS mentor. Ask about resumes, skills, interviews, projects, or
                  career strategy — I know your profile and goals.
                </p>
                <div className="mt-8 grid w-full max-w-lg gap-2">
                  <p className="mb-1 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Suggested prompts
                  </p>
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-left text-sm transition hover:border-primary/30 hover:bg-primary/5"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={`${msg.role}-${i}-${msg.content.slice(0, 20)}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20'
                            : 'border border-border bg-muted/40',
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {typing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted/40 px-4 py-3">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:300ms]" />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                {error}
              </div>
              <Button variant="outline" size="sm" onClick={retryLast}>
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="border-t border-border bg-muted/20 p-4 sm:p-5"
          >
            <div className="flex gap-3">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your career mentor anything..."
                className="min-h-[52px] max-h-32 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()} className="shrink-0">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Enter to send · Shift+Enter for new line
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
