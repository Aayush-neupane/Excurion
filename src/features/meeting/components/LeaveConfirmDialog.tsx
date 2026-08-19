import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useMeetingStore } from '@/store/useMeetingStore'
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

export function LeaveConfirmDialog() {
  const open = useUIStore((s) => s.dialogs['leave-confirm'] === true)
  const closeDialog = useUIStore((s) => s.closeDialog)
  const leave = useMeetingStore((s) => s.leave)
  const meeting = useMeetingStore((s) => s.meeting)
  const navigate = useNavigate()

  const handleLeave = async () => {
    closeDialog('leave-confirm')
    await leave()
    toast.info('You left the meeting')
    navigate('/app', { replace: true })
  }

  return (
    <Dialog open={open} onOpenChange={() => closeDialog('leave-confirm')}>
      <DialogContent className="sm:max-w-sm" aria-describedby="leave-desc">
        <DialogHeader>
          <DialogTitle>Leave meeting?</DialogTitle>
          <DialogDescription id="leave-desc">
            You're about to leave “{meeting?.title}”. If you're the host, the meeting will
            continue for everyone else.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => closeDialog('leave-confirm')}>
            Stay
          </Button>
          <Button variant="destructive" onClick={() => void handleLeave()}>
            Leave meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}