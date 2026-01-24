import { and, desc, eq, gte } from 'drizzle-orm'

import { db } from '~/db'
import { llmsTxts } from '~/db/schema'
import { generateId } from '~/utils/generate-id'

export async function getLlmsTxtByRepoUrl(repoUrl: string): Promise<any> {
  return await db.select().from(llmsTxts).where(eq(llmsTxts.repoUrl, repoUrl)).limit(1)
}

export async function getOrderedLlmsTxtByRepoUrl(repoUrl: string, maxUrls: number): Promise<any> {
  return await db
    .select()
    .from(llmsTxts)
    .where(and(gte(llmsTxts.maxUrls, maxUrls), eq(llmsTxts.repoUrl, repoUrl)))
    .orderBy(desc(llmsTxts.createdAt))
    .limit(1)
}

export interface LlmsTxt {
  repoUrl: string
  llmstxt: string
  llmstxtFull: string
  maxUrls: number
}

export async function updateLlmsTxtByRepoUrl({ repoUrl, llmstxt, llmstxtFull, maxUrls }: LlmsTxt) {
  return await db
    .update(llmsTxts)
    .set({
      llmstxt,
      llmstxtFull,
      maxUrls,
    })
    .where(eq(llmsTxts.repoUrl, repoUrl))
}

export async function createLlmsTxt({ llmstxt, llmstxtFull, maxUrls, repoUrl }: LlmsTxt) {
  const id = generateId()
  return await db
    .insert(llmsTxts)
    .values({ id, llmstxt, repoUrl, llmstxtFull, maxUrls })
    .returning()
}
