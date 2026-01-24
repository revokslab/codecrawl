import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { useTokenStore } from '~/store/use-token-store'
import { loginNextPathKey } from '~/lib/constants'
import { Route } from '~/routes/(auth)/_auth.signin'

export const useSaveTokens = () => {
  const params = Route.useSearch()
  const router = useRouter()

  const errorParam = params.error
  const accessTokenParam = params.accessToken
  const refreshTokenParam = params.refreshToken

  useEffect(() => {
    if (typeof errorParam === 'string' && errorParam) {
      console.error(errorParam)
    }

    if (
      typeof accessTokenParam === 'string' &&
      typeof refreshTokenParam === 'string' &&
      accessTokenParam &&
      refreshTokenParam
    ) {
      useTokenStore.getState().setTokens({
        accessToken: accessTokenParam,
        refreshToken: refreshTokenParam,
      })

      let nextPath = '/app/playground'

      try {
        const loginNextPath = localStorage.getItem(loginNextPathKey)

        if (loginNextPath?.startsWith('/')) {
          nextPath = loginNextPath
          localStorage.setItem(loginNextPathKey, '')
        }

        // redirect the user to the next page 100ms will be unnoticable
        setTimeout(() => router.navigate({ to: nextPath }), 100)
      } catch {}
    }
  }, [errorParam, accessTokenParam, refreshTokenParam, router])
}
