'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { feedback, favoritePrompt, learningProgress } from '@/lib/db/schema'
import { and, desc, eq, gte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

const validPromptIds = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
const validPaths = new Set(['Beginner', 'Intermediate', 'Builder'])

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getUserData() {
  const userId = await getUserId()
  const [favoriteRows, progressRows] = await Promise.all([
    db.select({ promptId: favoritePrompt.promptId }).from(favoritePrompt).where(eq(favoritePrompt.userId, userId)),
    db.select({ pathName: learningProgress.pathName, checks: learningProgress.checks }).from(learningProgress).where(eq(learningProgress.userId, userId)),
  ])
  return { favorites: favoriteRows.map((row) => row.promptId), progress: progressRows }
}

export async function saveFeedback(message: string) {
  const userId = await getUserId()
  const trimmed = message.trim()
  if (!trimmed) throw new Error('Feedback is required')
  if (trimmed.length > 4000) throw new Error('Feedback is too long')
  const windowStart = new Date(Date.now() - 60 * 60 * 1000)
  const recent = await db.select({ id: feedback.id }).from(feedback).where(and(eq(feedback.userId, userId), gte(feedback.createdAt, windowStart))).orderBy(desc(feedback.createdAt)).limit(5)
  if (recent.length >= 5) throw new Error('Please wait before sending more feedback')
  await db.insert(feedback).values({ userId, message: trimmed })
  revalidatePath('/')
}

export async function toggleFavorite(promptId: number, favorite: boolean) {
  const userId = await getUserId()
  if (!Number.isInteger(promptId) || !validPromptIds.has(promptId)) throw new Error('Invalid prompt')
  if (favorite) await db.insert(favoritePrompt).values({ userId, promptId }).onConflictDoNothing()
  else await db.delete(favoritePrompt).where(and(eq(favoritePrompt.userId, userId), eq(favoritePrompt.promptId, promptId)))
  revalidatePath('/')
}

export async function saveLearningProgress(pathName: string, checks: boolean[]) {
  const userId = await getUserId()
  if (!validPaths.has(pathName) || !Array.isArray(checks) || checks.length !== 3 || checks.some((check) => typeof check !== 'boolean')) throw new Error('Invalid learning progress')
  await db.insert(learningProgress).values({ userId, pathName, checks }).onConflictDoUpdate({ target: [learningProgress.userId, learningProgress.pathName], set: { checks, updatedAt: new Date() } })
  revalidatePath('/')
}
