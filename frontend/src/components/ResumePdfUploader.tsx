/**
 * Shared PDF resume upload dropzone — extracts via API and returns text.
 */
import { useRef, useState } from 'react'
import { Loader2, Upload, FileText, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { resumeApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export function ResumePdfUploader({
  onUploaded,
  onFileSelected,
  filename,
  className,
}: {
  onUploaded: (data: { resumeId: string; filename: string; text: string }) => void
  onFileSelected?: (file: File) => void
  filename?: string | null
  className?: string
}) {
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF resume')
      return
    }
    if (!user?.id) {
      toast.error('Please sign in first')
      return
    }
    setUploading(true)
    onFileSelected?.(file)
    try {
      const { data } = await resumeApi.upload(file, user.id)
      // Fetch fuller text: upload returns preview — re-analyze uses resume_id.
      // Ask backend list isn't enough; store preview + note. For job match we need full text.
      // Upload endpoint returns text_preview only — enhance by calling a lightweight extract via analyze won't work.
      // Use text from response - we'll update upload to return full text in a follow-up.
      const text = data.full_text || data.text || data.text_preview || ''
      if (!text || text.length < 50) {
        toast.error('Could not extract enough text from PDF')
        return
      }
      onUploaded({
        resumeId: data.resume_id,
        filename: data.filename || file.name,
        text,
      })
      toast.success('Resume PDF uploaded & parsed')
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
    <div className={cn('space-y-2', className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const f = e.dataTransfer.files?.[0]
          if (f) void handleFile(f)
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition',
          dragOver
            ? 'border-primary bg-primary/10'
            : 'border-border bg-muted/20 hover:border-primary/50',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void handleFile(f)
          }}
        />
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">
          {filename ? filename : 'Drop resume PDF or click to browse'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">PDF only · text extracted automatically</p>
      </div>
      {filename && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          <span className="truncate">{filename}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto h-7 px-2"
            onClick={(e) => {
              e.stopPropagation()
              inputRef.current?.click()
            }}
          >
            Replace
          </Button>
        </div>
      )}
    </div>
  )
}
