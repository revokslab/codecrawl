import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Flex, Separator } from '@radix-ui/themes'
import { Sidebar } from '~/components/sidebar'
import { seo } from '~/utils/seo'
import { useVerifyLoggedIn } from '~/hooks/use-verify-login'
import { AuthContextProvider } from '~/contexts/auth-context'

export const Route = createFileRoute('/app/_app')({
  component: RouteComponent,
  head(ctx) {
    return {
      meta: [...seo({ title: 'Codecrawl' })],
    }
  },
})

function RouteComponent() {
  useVerifyLoggedIn()

  return (
    <AuthContextProvider>
      <Flex direction={'column'} flexGrow={'1'}>
        <Flex flexGrow={'1'} className='h-screen'>
          <Sidebar />
          <Separator size={'4'} orientation='vertical' className='bg-[color:var(--gray-a3)]' />
          <Flex direction={'column'} px={'5'} overflowY={'scroll'} flexGrow={'1'} height={'100%'}>
            <Flex
              direction={'column'}
              my={'5'}
              className='mx-auto w-full max-w-2xl'
              height={'100%'}
            >
              <Outlet />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </AuthContextProvider>
  )
}
