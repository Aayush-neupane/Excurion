import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/common/LoadingState'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [devCode, setDevCode] = useState<string | undefined>(undefined)
  const showDevCode = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEV_CODES === 'true'

  const sendOtp = useMutation({
    mutationFn: () => authApi.sendForgotPasswordOtp(email),
    onSuccess: (result) => {
      setDevCode(result.devCode)
      setCode('')
      toast.success(`We sent a reset code to ${email.trim().toLowerCase()}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const resetPassword = useMutation({
    mutationFn: () => authApi.resetPasswordWithOtp({ email, code, newPassword }),
    onSuccess: () => {
      toast.success('Password updated. You can sign in now.')
      navigate('/login', { replace: true })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendOtp.mutate()
  }

  const handleResetSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (code.trim().length !== 6) {
      toast.error('Enter the 6-digit code from the email.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    resetPassword.mutate()
  }

  return (
    <form onSubmit={sendOtp.isSuccess ? handleResetSubmit : handleEmailSubmit} className="space-y-5" noValidate>
      {sendOtp.isSuccess ? (
        <>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Enter the email associated with your account and we'll send you a one-time code to
            reset your password.
          </p>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={sendOtp.isPending}>
            {sendOtp.isPending ? <Spinner /> : null}
            {sendOtp.isPending ? 'Sending code…' : 'Send reset code'}
            {!sendOtp.isPending && <ArrowRight />}
          </Button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => sendOtp.reset()}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="pl-9 text-center text-lg tracking-[0.5em]"
              />
            </div>
            {showDevCode && devCode ? (
              <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-xs text-primary">
                <span className="font-semibold">Dev mode:</span> no email provider configured — your code is{' '}
                <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-sm font-bold tracking-[0.2em]">
                  {devCode}
                </span>
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Sent to <span className="font-medium text-foreground">{email.trim().toLowerCase()}</span>.{' '}
              <button
                type="button"
                onClick={() => sendOtp.mutate()}
                disabled={sendOtp.isPending}
                className="font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
              >
                Resend code
              </button>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirm new password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="confirm-new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
            {resetPassword.isPending ? <Spinner /> : null}
            {resetPassword.isPending ? 'Resetting…' : 'Reset password'}
            {!resetPassword.isPending && <ArrowRight />}
          </Button>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link
          to="/login"
          className="font-medium text-primary transition-colors hover:text-primary/80"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  )
}