import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { meetingApi } from '@/api/meeting.api'
import { FullPageLoader } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'

export default function JoinInvitePage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomCode) {
      setError('This invite link is missing its room code.')
      return
    }
    let cancelled = false
    meetingApi
      .getRoomByCode(roomCode)
      .then((meeting) => {
        if (cancelled) return
        if (!meeting) {
          setError('We could not find a room with that code. It may have been removed.')
          return
        }
        navigate(`/meeting/${meeting.id}`, { replace: true })
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [roomCode, navigate])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <Logo />
        <ErrorState title={error} />
        <Button onClick={() => navigate('/app', { replace: true })}>Go to dashboard</Button>
      </div>
    )
  }

  return <FullPageLoader label="Joining the room…" />
}
