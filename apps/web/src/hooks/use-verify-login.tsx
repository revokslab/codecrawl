import { useTokenStore } from '~/store/use-token-store'
import { useRouter, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

export const useVerifyLoggedIn = () => {
  const router = useRouter()
  const asPath = useLocation().pathname
  const hasTokens = useTokenStore((s) => !!(s.accessToken && s.refreshToken))

  useEffect(() => {
    if (!hasTokens) {
      router.navigate({
        to: '/signin',
        search: { next: `/${asPath}` },
      })
    }
  }, [hasTokens, asPath, router])

  return hasTokens
}
