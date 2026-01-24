import { Flex } from '@radix-ui/themes'
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTokenStore } from '~/store/use-token-store'

export const Route = createFileRoute('/(auth)/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const hasTokens = useTokenStore((s) => !!(s.accessToken && s.refreshToken))

  useEffect(() => {
    if (hasTokens) {
      router.navigate({ to: '/app/playground' })
    }
  }, [hasTokens, router])

  return (
    <Flex
      align={'center'}
      justify={'center'}
      className='h-screen'
      style={{ backgroundColor: 'var(--gray-1)' }}
    >
      <Outlet />
    </Flex>
  )
}
