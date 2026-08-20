import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Eye, EyeOff, GraduationCap, KeyRound, Lock, Mail, User } from 'lucide-react'
import { toast } from 'sonner'
import type { Role } from '@/types/user'
import { authApi } from '@/api'
import { useUserStore } from '@/store/useUserStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/common/LoadingState'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const completeAuth = useUserStore((s) => s.completeAuth)
  const navigate = useNavigate()
  const [step, setStep] = useState<'details' | 'code'>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('teacher')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [devCode, setDevCode] = useState<string | undefined>(undefined)
  const showDevCode = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEV_CODES === 'true'

  const sendOtp = useMutation({
    mutationFn: () => authApi.sendRegisterOtp({ name, email, role }),
    onSuccess: (result) => {
      setDevCode(result.devCode)
      setCode('')
      setStep('code')
      toast.success(`We sent a 6-digit code to ${email.trim().toLowerCase()}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const verifyCode = useMutation({
    mutationFn: () => authApi.verifyRegisterOtp({ email, code, password, name, role }),
    onSuccess: (session) => {
      completeAuth(session)
      toast.success('Account created! Welcome to Excurion.')
      navigate('/app', { replace: true })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleDetailsSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (password.length > 0 && password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    sendOtp.mutate()
  }

  const handleCodeSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (code.trim().length !== 6) {
      toast.error('Enter the 6-digit code from the email.')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    verifyCode.mutate()
  }

  return (
    <form onSubmit={step === 'details' ? handleDetailsSubmit : handleCodeSubmit} className="space-y-4" noValidate>
      {step === 'details' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="role">I want to…</Label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Choose your role">
              {(
                [
                  { value: 'teacher', label: 'Teach', icon: GraduationCap },
                  { value: 'student', label: 'Learn', icon: User },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={role === option.value}
                  onClick={() => setRole(option.value)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                    role === option.value
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="name"
                autoComplete="name"
                required
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

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
            <p className="text-xs text-muted-foreground">
              We'll email you a one-time verification code.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={sendOtp.isPending}>
            {sendOtp.isPending ? <Spinner /> : null}
            {sendOtp.isPending ? 'Sending code…' : 'Send verification code'}
            {!sendOtp.isPending && <ArrowRight />}
          </Button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setStep('details')
              toast.info(`Use code sent to ${email.trim().toLowerCase()} to continue, or edit the email and resend.`)
            }}
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
            <Label htmlFor="password">Choose a password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <Label htmlFor="confirm-password">Confirm password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={verifyCode.isPending}>
            {verifyCode.isPending ? <Spinner /> : null}
            {verifyCode.isPending ? 'Verifying…' : 'Create account'}
            {!verifyCode.isPending && <ArrowRight />}
          </Button>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-primary transition-colors hover:text-primary/80"
        >
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground/70">
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  )
}