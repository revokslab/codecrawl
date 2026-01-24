import { Avatar, Box, Button, Card, Flex, Text } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import { SvgLogo } from '~/components/svgs'
import { signIn } from '~/lib/auth-client'

export const Route = createFileRoute('/(auth)/_auth/signin')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Box className='max-w-lg'>
      <Card size='1' className='p-4' variant='classic'>
        <Flex direction='column' gap='5' p={'4'}>
          <Flex direction='column' gap='2'>
            <Avatar fallback={<SvgLogo />} color='gray' mb={'4'} />
            <Text size={'5'} weight={'medium'}>
              Sign in to your account
            </Text>
          </Flex>

          <Button onClick={() => signIn.social({ provider: 'google' })}>Sign in with Google</Button>
        </Flex>
      </Card>
    </Box>
  )
}
