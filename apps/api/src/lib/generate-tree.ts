import { redisConnection } from '~/services/queue-service'

export interface TreeGenerationData {
  id: string
  userId: string
  createdAt: number
  status: 'processing' | 'completed' | 'failed'
  url: string
  fileTree: string
  error?: string
}

export async function saveTreeGenerationData(data: TreeGenerationData) {
  await redisConnection.set(`tree:${data.id}`, JSON.stringify(data))
}

export async function getTreeGenerationData(id: string) {
  const data = await redisConnection.get(`tree:${id}`)
  return data ? JSON.parse(data) : null
}

export async function updateTreeGenerationData(id: string, data: Partial<TreeGenerationData>) {
  const current = await getTreeGenerationData(id)
  if (!current) return

  const updatedGeneration = {
    ...current,
    ...data,
  }

  await redisConnection.set(`tree:${id}`, JSON.stringify(updatedGeneration))
}

export async function getTreeGenerationDataExpiry(id: string) {
  const d = new Date()
  const ttl = await redisConnection.pttl(`tree:${id}`)
  d.setMilliseconds(d.getMilliseconds() + ttl)
  d.setMilliseconds(0)
  return d
}

export async function updateTreeGenerationDataStatus(
  id: string,
  status: 'processing' | 'completed' | 'failed',
  fileTree?: string,
  error?: string
) {
  const updates: Partial<TreeGenerationData> = { status }
  if (fileTree !== undefined) updates.fileTree = fileTree
  if (error !== undefined) updates.error = error
  await updateTreeGenerationData(id, updates)
}
