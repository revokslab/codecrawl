import { eq } from 'drizzle-orm'

import type { Database } from '~/db'
import { user } from '~/db/schema'

export async function getUserById(db: Database, id: string) {
  return await db.query.user.findFirst({
    where: eq(user.id, id),
  })
}
