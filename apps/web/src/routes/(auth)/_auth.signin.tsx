import { IconLoader2 } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { Google, SvgLogo } from '~/components/svgs'
import { Button } from '~/components/ui/button'
import { authClient } from '~/lib/auth-client'
import { BASE_URL } from '~/lib/constants'

export const Route = createFileRoute('/(auth)/_auth/signin')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${BASE_URL}/app`,
      })
    } catch {
      toast.error('Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='w-full max-w-sm space-y-8'>
      <div className='flex flex-col items-center gap-2 text-center'>
        <SvgLogo className='w-10 h-10' />
        <h1 className='font-bold text-3xl tracking-tight'>Codecrawl</h1>
        <p className='mt-2 text-muted-foreground text-sm'>Sign in to continue to your account.</p>
      </div>

      <div className='p-6'>
        <div className='space-y-4'>
          <Button
            variant='outline'
            size='lg'
            className='w-full'
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <IconLoader2 className='animate-spin' size={18} />
            ) : (
              <Google className='size-4' />
            )}
            Continue with Google
          </Button>
        </div>
      </div>

      <p className='text-center text-muted-foreground text-xs'>
        By continuing, you agree to our{' '}
        <Link to='/' className='underline'>
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to='/' className='underline'>
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
