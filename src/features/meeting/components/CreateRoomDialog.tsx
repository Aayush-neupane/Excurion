import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { Clock, Presentation, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { MeetingType } from '@/types/meeting'
import { meetingApi } from '@/api'
import { useUIStore } from '@/store/useUIStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/common/LoadingState'
import { cn } from '@/lib/utils'

const MEETING_TYPES: { value: MeetingType; label: string; icon: typeof Users; hint: string }[] = [
  { value: 'class', label: 'Class', icon: Users, hint: 'Standard lesson' },
  { value: '1on1', label: '1:1', icon: Users, hint: 'Mentorship' },
  { value: 'webinar', label: 'Webinar', icon: Presentation, hint: 'Large audience' },
  { value: 'office-hours', label: 'Office hours', icon: Clock, hint: 'Open Q&A' },
]

export function CreateRoomDialog() {
  const open = useUIStore((s) => s.dialogs['create-room'] === true)
  const closeDialog = useUIStore((s) => s.closeDialog)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [type, setType] = useState<MeetingType>('class')

  const mutation = useMutation({
    mutationFn: () => meetingApi.createRoom({ title, type }),
    onSuccess: (result) => {
      closeDialog('create-room')
      setTitle('')
      navigate(`/meeting/${result.meeting.id}`)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Give your room a title first.')
      return
    }
    mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? closeDialog('create-room') : closeDialog('create-room'))}>
      <DialogContent className="sm:max-w-md" aria-describedby="create-room-desc">
        <DialogHeader>
          <DialogTitle>Create a room</DialogTitle>
          <DialogDescription id="create-room-desc">
            Start teaching in seconds — share the room code with your students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="room-title">Room title</Label>
            <Input
              id="room-title"
              autoFocus
              placeholder="e.g. Algebra — Quadratic Equations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              required
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Meeting type</legend>
            <div className="grid grid-cols-2 gap-2">
              {MEETING_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  aria-pressed={type === t.value}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-all',
                    type === t.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent',
                  )}
                >
                  <t.icon className={cn('h-4 w-4 shrink-0', type === t.value ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{t.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{t.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => closeDialog('create-room')}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              {mutation.isPending ? 'Creating room…' : 'Create room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}