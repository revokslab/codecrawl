import { expandScopes } from '@codecrawl/common/scopes'
import { getSessionCookie } from 'better-auth/cookies'
import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { apiKeyCache } from '~/cache/api-keys-cache'
import { userCache } from '~/cache/users-cache'
import { getApiKeyByToken, getUserById, updatedApiKeyLastUsedAt } from '~/db/queries'
import { auth } from '~/lib/auth'
import { hash } from '~/lib/encryption'
import { isValidApiKeyFormat } from '~/utils/api-keys'

export const withAuth: MiddlewareHandler = async (c, next) => {
  const sessionCookie = getSessionCookie(c.req.raw.headers, {
    cookiePrefix: 'codecrawl',
  })
  const authHeader = c.req.header('Authorization')

  try {
    if (sessionCookie) {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      })

      if (!session || !session.user) {
        throw new HTTPException(401, {
          message: 'Not authenticated',
        })
      }

      c.set('session', session)
      c.set('scopes', expandScopes(['apis.all']))

      await next()
      return
    }

    if (!authHeader) {
      throw new HTTPException(401, {
        message: 'Authorization header required',
      })
    }

    const [scheme, token] = authHeader.split(' ')

    if (scheme !== 'Bearer') {
      throw new HTTPException(401, { message: 'Invalid authorization scheme' })
    }

    if (!token) {
      throw new HTTPException(401, { message: 'Token required' })
    }

    // Handle API keys (start with cc_ but not cc_access_token_)
    if (!token.startsWith('cc_') || !isValidApiKeyFormat(token)) {
      throw new HTTPException(401, { message: 'Invalid token format' })
    }

    const db = c.get('db')
    const keyHash = hash(token)

    // Check cache first for API key
    let apiKey = await apiKeyCache.get(keyHash)

    if (!apiKey) {
      // If not cache, query database
      apiKey = await getApiKeyByToken(db, keyHash)
      if (apiKey) {
        // Store in cache for future requests
        await apiKeyCache.set(keyHash, apiKey)
      }
    }

    if (!apiKey) {
      throw new HTTPException(401, { message: 'Invalid API key' })
    }

    // Check cache first for user
    let user = await userCache.get(apiKey.userId)

    if (!user) {
      // If not cache, query database
      user = await getUserById(db, apiKey.userId)
      if (user) {
        // Store in cache for future requests
        await userCache.set(apiKey.userId, user)
      }
    }

    if (!user) {
      throw new HTTPException(401, { message: 'User not found' })
    }

    const session = {
      user: {
        id: user.id,
        email: user.email,
        image: user.image,
      },
    }

    c.set('session', session)
    c.set('scopes', expandScopes(apiKey.scopes ?? []))

    // Update last used at
    updatedApiKeyLastUsedAt(db, apiKey.id)

    await next()
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    throw error
  }
}
