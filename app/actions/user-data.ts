'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { feedback, favoritePrompt, learningProgress } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function saveFeedback(message: string) {
  const userId = await getUserId()
  const clean = message.trim().slice(0, 4000)
  if (!clean) throw new Error('Feedback is required')
  await db.insert(feedback).values({ userId, message: clean })
  revalidatePath('/')
}

export async function toggleFavorite(promptId: number, favorite: boolean) {
  const userId = await getUserId()
  if (favorite) await db.insert(favoritePrompt).values({ userId, promptId }).onConflictDoNothing()
  else await db.delete(favoritePrompt).where(and(eq(favoritePrompt.userId, userId), eq(favoritePrompt.promptId, promptId)))
  revalidatePath('/')
}

export async function saveLearningProgress(pathName: string, checks: boolean[]) {
  const userId = await getUserId()
  await db.insert(learningProgress).values({ userId, pathName: pathName.slice(0, 80), checks: checks.slice(0, 10) }).onConflictDoUpdate({ target: [learningProgress.userId, learningProgress.pathName], set: { checks: checks.slice(0, 10), updatedAt: new Date() } })
  revalidatePath('/')
}
