import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye,
  FileText,
  Library,
  MessageSquare,
  Pencil,
  Trash2,
  Briefcase,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Badge } from '@/components/ui/input'
import { RecommendationBanner } from '@/components/RecommendationBanner'
import { useWorkspace } from '@/store/workspace'

export default function LibraryPage() {
  const documents = useWorkspace((s) => s.documents)
  const removeDocument = useWorkspace((s) => s.removeDocument)
  const renameDocument = useWorkspace((s) => s.renameDocument)
  const setRagCollectionId = useWorkspace((s) => s.setRagCollectionId)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const preview = documents.find((d) => d.id === previewId)

  const startRename = (id: string, name: string) => {
    setRenamingId(id)
    setRenameValue(name)
  }

  const saveRename = () => {
    if (!renamingId || !renameValue.trim()) return
    renameDocument(renamingId, renameValue.trim())
    setRenamingId(null)
    toast.success('Document renamed')
  }

  const reuseInMentor = (doc: (typeof documents)[0]) => {
    if (doc.collection_id) setRagCollectionId(doc.collection_id)
    toast.success(`Ready to reuse “${doc.filename}” in AI Mentor`)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Library className="h-8 w-8 text-primary" /> PDF Knowledge Library
        </h1>
        <p className="mt-1 text-muted-foreground">
          Every uploaded PDF stays here — view, rename, delete, or reuse across modules.
        </p>
      </motion.div>

      <RecommendationBanner />

      {!documents.length ? (
        <Card className="glass">
          <CardContent className="space-y-4 p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-semibold">No PDFs uploaded yet</p>
            <p className="text-sm text-muted-foreground">
              Upload a resume or attach documents in Job Prep / AI Mentor — they all land here.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link to="/app/resume">Upload Resume</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/app/chat">Open AI Mentor</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((doc) => (
            <Card key={doc.id} className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {renamingId === doc.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="h-8"
                        />
                        <Button size="sm" onClick={saveRename}>
                          Save
                        </Button>
                      </div>
                    ) : (
                      <CardTitle className="truncate text-base">{doc.filename}</CardTitle>
                    )}
                    <CardDescription>
                      {new Date(doc.uploadedAt).toLocaleString()} · {doc.text.length} chars
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{doc.source}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => setPreviewId(doc.id)}>
                  <Eye className="h-3.5 w-3.5" /> View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startRename(doc.id, doc.filename)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Rename
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/app/chat" onClick={() => reuseInMentor(doc)}>
                    <MessageSquare className="h-3.5 w-3.5" /> Mentor
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/app/job-prep">
                    <Briefcase className="h-3.5 w-3.5" /> Job Prep
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/app/resume">
                    <FileText className="h-3.5 w-3.5" /> Resume AI
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-500"
                  onClick={() => {
                    if (confirm(`Delete ${doc.filename}?`)) {
                      removeDocument(doc.id)
                      toast.success('Deleted')
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {preview && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">{preview.filename}</CardTitle>
            <CardDescription>Extracted text preview</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-xs leading-relaxed">
              {preview.text.slice(0, 8000)}
              {preview.text.length > 8000 ? '…' : ''}
            </pre>
            <Button className="mt-3" variant="outline" size="sm" onClick={() => setPreviewId(null)}>
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
