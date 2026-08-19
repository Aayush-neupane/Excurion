import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'
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
import { ROOM_CODE_REGEX } from '@/constants'

function formatRoomCode(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12)
    .replace(/(.{4})(?=.)/g, '$1-')
}

export function JoinRoomDialog() {
  const open = useUIStore((s) => s.dialogs['join-room'] === true)
  const closeDialog = useUIStore((s) => s.closeDialog)
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  const mutation = useMutation({
    mutationFn: () => meetingApi.joinRoom({ roomCode: code }),
    onSuccess: (result) => {
      closeDialog('join-room')
      setCode('')
      navigate(`/meeting/${result.meeting.id}`)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!ROOM_CODE_REGEX.test(code)) {
      toast.error('Enter a valid room code — e.g. abcd-1234-ef56')
      return
    }
    mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={() => closeDialog('join-room')}>
      <DialogContent className="sm:max-w-md" aria-describedby="join-room-desc">
        <DialogHeader>
          <DialogTitle>Join a room</DialogTitle>
          <DialogDescription id="join-room-desc">
            Ask your instructor for the room code and enter it below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="room-code">Room code</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="room-code"
                autoFocus
                placeholder="abcd-1234-ef56"
                value={code}
                onChange={(e) => setCode(formatRoomCode(e.target.value))}
                className="pl-9 font-mono tracking-wider"
                maxLength={14}
                autoCapitalize="off"
                spellCheck={false}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Codes look like <span className="font-mono">abcd-1234-ef56</span>.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => closeDialog('join-room')}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || code.length < 14}>
              {mutation.isPending && <Spinner />}
              {mutation.isPending ? 'Joining…' : 'Join room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}