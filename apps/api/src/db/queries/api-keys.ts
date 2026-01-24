import { eq } from 'drizzle-orm'

import type { Database } from '~/db'
import { apiKeys } from '~/db/schema'
import { encrypt, hash } from '~/lib/encryption'
import { generateApiKey } from '~/utils/api-keys'
import { generateId } from '~/utils/generate-id'

export type ApiKey = {
  id: string
  name: string
  userId: string
  createdAt: string
  scopes: string[] | null
}

export async function getApiKeyByToken(db: Database, keyHash: string) {
  const [result] = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      userId: apiKeys.userId,
      createdAt: apiKeys.createdAt,
      scopes: apiKeys.scopes,
      lastUsedAt: apiKeys.lastUsedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1)
  return result
}

type UpsertApiKeyData = {
  id?: string
  name: string
  userId: string
  scopes: string[]
}

export async function upsertApiKey(db: Database, data: UpsertApiKeyData) {
  if (data.id) {
    const [result] = await db
      .update(apiKeys)
      .set({ name: data.name, scopes: data.scopes })
      .where(eq(apiKeys.id, data.id))
      .returning({ keyHash: apiKeys.keyHash })

    // On update we don't return the key, but return keyHash for cache invalidation
    return {
      key: null,
      keyHash: result?.keyHash,
    }
  }

  const key = generateApiKey()
  const keyEncrypted = encrypt(key)
  const keyHash = hash(key)

  const [result] = await db
    .insert(apiKeys)
    .values({
      id: generateId(),
      keyEncrypted,
      keyHash,
      name: data.name,
      userId: data.userId,
      scopes: data.scopes,
    })
    .returning({
      id: apiKeys.id,
      name: apiKeys.name,
      createdAt: apiKeys.createdAt,
    })

  return {
    key,
    data: result,
  }
}

export async function getApiKeysByUser(db: Database, userId: string) {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      createdAt: apiKeys.createdAt,
      scopes: apiKeys.scopes,
      lastUsedAt: apiKeys.lastUsedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(apiKeys.createdAt)
}

type DeleteApiKeyParams = {
  id: string
}

export async function deleteApiKey(db: Database, params: DeleteApiKeyParams) {
  const [result] = await db
    .delete(apiKeys)
    .where(eq(apiKeys.id, params.id))
    .returning({ keyHash: apiKeys.keyHash })

  // Return keyHash for cache invalidation by calling code
  return result?.keyHash
}

export async function updatedApiKeyLastUsedAt(db: Database, id: string) {
  return await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(apiKeys.id, id))
}
