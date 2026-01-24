import { Flex } from '@radix-ui/themes'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
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
