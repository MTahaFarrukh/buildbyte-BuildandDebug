import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  Upload,
  User,
  Lightbulb,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea, Badge } from '@/components/ui/input'
import { chatApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { buildMentorContext, useWorkspace } from '@/store/workspace'
import { RecommendationBanner } from '@/components/RecommendationBanner'
import { cn } from '@/lib/utils'

const SUGGESTED = [
  'What should I study next based on my completed roadmap tasks?',
  'Give me a STAR answer outline for a teamwork question.',
  'Based on my uploaded docs, what skills am I missing?',
  'Quiz me with one technical interview question.',
]

export default function ChatPage() {
  const { user } = useAuth()
  const {
    mentorChat,
    documents,
    ragCollectionId,
    appendMentorChat,
    setMentorChat,
    addDocument,
    setRagCollectionId,
    getNextTask,
    getRoadmapProgress,
  } = useWorkspace()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const next = getNextTask()
  const snap = useWorkspace((s) => s.getScoreSnapshot)
  const recs = useWorkspace((s) => s.getRecommendations)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [mentorChat, loading])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    appendMentorChat({ role: 'user', content: trimmed })
    setInput('')
    setLoading(true)
    try {
      const ctx = [
        buildMentorContext(),
        ragCollectionId ? `collection_id: ${ragCollectionId}` : '',
      ]
        .filter(Boolean)
        .join('\n')
      const { data } = await chatApi.send({
        message: trimmed,
        chat_history: mentorChat.map((m) => ({ role: m.role, content: m.content })),
        user_context: ctx,
        collection_id: ragCollectionId || undefined,
      })
      appendMentorChat({ role: 'assistant', content: data.reply })
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Chat failed')
    } finally {
      setLoading(false)
    }
  }

  const uploadPdf = async (file: File) => {
    if (!user?.id) {
      toast.error('Sign in required')
      return
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('PDF only')
      return
    }
    setUploading(true)
    try {
      const { data } = await chatApi.uploadPdf(file, user.id, 'mentor')
      if (data.collection_id) setRagCollectionId(data.collection_id)
      addDocument({
        id: data.doc_id || `${Date.now()}`,
        filename: file.name,
        text: '',
        source: 'mentor',
        uploadedAt: new Date().toISOString(),
        collection_id: data.collection_id,
      })
      toast.success(`Embedded ${data.chunks || 0} chunks from ${file.name}`)
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (e instanceof Error ? e.message : 'Upload failed')
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col gap-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">AI Mentor</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          RAG-powered coach that knows your roadmap progress
          {next ? ` — next up: ${next.title}` : ''}. Upload PDFs for grounded answers.
        </p>
      </motion.div>

      <RecommendationBanner />

      <Card className="glass shrink-0">
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <Button
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload PDF
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void uploadPdf(f)
            }}
          />
          <Badge variant="outline">Progress {getRoadmapProgress()}%</Badge>
          {documents.map((d) => (
            <Badge key={d.id} variant="accent" className="gap-1">
              <FileText className="h-3 w-3" /> {d.filename}
            </Badge>
          ))}
          {documents.length === 0 && (
            <span className="text-xs text-muted-foreground">
              Resume, notes, JDs, career guides supported
            </span>
          )}
        </CardContent>
      </Card>

      <Card className="glass flex min-h-0 flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 min-h-0 space-y-3 overflow-y-auto p-4">
          {mentorChat.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <MessageSquare className="mb-3 h-10 w-10 text-primary" />
              <p className="font-medium">Your AI career coach is ready</p>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                {(() => {
                  const s = snap()
                  const r = recs()[0]
                  return (
                    <>
                      Career Score <strong>{s.current}</strong>
                      {s.weeklyDelta !== 0 && (
                        <>
                          {' '}
                          ({s.weeklyDelta > 0 ? '+' : ''}
                          {s.weeklyDelta} recently)
                        </>
                      )}
                      . Roadmap {getRoadmapProgress()}%.
                      {next ? ` After your last wins, I recommend: ${next.title}.` : ''}
                      {r ? ` Next best action: ${r.title}.` : ''}
                    </>
                  )
                })()}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {SUGGESTED.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => void send(p)}
                    className="flex max-w-xs items-start gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 text-left text-xs hover:bg-muted"
                  >
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mentorChat.map((m, i) => (
            <div
              key={`${m.at || i}-${i}`}
              className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {m.role === 'assistant' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  m.role === 'user' ? 'bg-primary text-white' : 'bg-muted/50 border border-border',
                )}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking with retrieved context…
            </div>
          )}
        </div>
        <div className="border-t border-border p-3">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your resume, roadmap, or uploaded PDFs…"
              className="min-h-[48px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send(input)
                }
              }}
            />
            <Button onClick={() => void send(input)} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={() => setMentorChat([])} title="Clear chat">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
