import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'

export default async function SignUpPage() {
  if ((await auth.api.getSession({ headers: await headers() }))?.user) redirect('/')
  return <main className="auth-page"><div className="auth-card"><span className="eyebrow">AI Starter</span><h1>Create your account</h1><p>Save favorites and keep your learning progress across visits.</p><AuthForm mode="sign-up" /><Link href="/sign-in">Already have an account? Sign in</Link></div></main>
}
