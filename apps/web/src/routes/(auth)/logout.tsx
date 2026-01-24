import { Button } from '@radix-ui/themes'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { signOut } from '~/lib/auth-client'

export const Route = createFileRoute('/(auth)/logout')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()

  return (
    <div className='flex flex-col gap-4 justify-center items-center h-full'>
      <p>Are you sure you want to logout?</p>
      <div className='flex gap-2'>
        <Button onClick={() => router.navigate({ to: '/app/playground' })}>Cancel</Button>
        <Button
          variant='outline'
          color='red'
          onClick={() => {
            signOut()
            router.navigate({ to: '/' })
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  )
}
