import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'

export default async function SignInPage() {
  if ((await auth.api.getSession({ headers: await headers() }))?.user) redirect('/')
  return <main className="auth-page"><div className="auth-card"><span className="eyebrow">AI Starter</span><h1>Welcome back</h1><p>Sign in to keep your favorites, feedback, and learning progress.</p><AuthForm mode="sign-in" /><Link href="/sign-up">Need an account? Create one</Link></div></main>
}
