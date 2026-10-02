'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setPending(true)
    const data = new FormData(event.currentTarget)
    const result = mode === 'sign-up' ? await authClient.signUp.email({ name: String(data.get('name')), email: String(data.get('email')), password: String(data.get('password')) }) : await authClient.signIn.email({ email: String(data.get('email')), password: String(data.get('password')) })
    setPending(false)
    if (result.error) { setError('We could not complete that request. Check your details and try again.'); return }
    router.push('/'); router.refresh()
  }
  return <form className="auth-form" onSubmit={submit}>{mode === 'sign-up' && <label>Name<input name="name" required /></label>}<label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" minLength={8} required /></label>{error && <p role="alert">{error}</p>}<button className="button primary" disabled={pending}>{pending ? 'Working…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button><Link className="back-home" href="/">Back to home</Link></form>
}
