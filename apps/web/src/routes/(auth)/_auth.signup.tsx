import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { Avatar, Box, Button, Card, Flex, Text, TextField } from '@radix-ui/themes'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'

import { SvgLogo } from '~/components/svgs'
import { toast } from '~/components/ui/toast'
import { API_BASE_URL } from '~/lib/constants'

const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(5, { message: 'Password must be at least 5 characters long' }),
})

type SignupSchemaType = z.infer<typeof signupSchema>

export const Route = createFileRoute('/(auth)/_auth/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupSchemaType>({ resolver: zodResolver(signupSchema) })
  const { mutateAsync } = useMutation({
    mutationKey: ['signup'],
    mutationFn: async (values: SignupSchemaType) => {
      return await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
    },
  })

  const onSubmit: SubmitHandler<SignupSchemaType> = async (values) => {
    try {
      const response = await mutateAsync(values)
      const data = await response.json()
      console.log(data)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Something went wrong',
        button: {
          label: 'Close',
          onClick: () => {},
        },
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box className='max-w-md'>
        <Card size='1' className='p-4' variant='classic'>
          <Flex direction='column' gap='5' p={'4'}>
            <Flex direction='column' gap='2'>
              <Avatar fallback={<SvgLogo />} color='gray' mb={'4'} />
              <Text size={'5'} weight={'medium'}>
                Sign up for a new account
              </Text>
              <Text size={'2'} color={'gray'}>
                Already a member?{' '}
                <Link to='/signin'>
                  <Text as={'span'} color={'gray'} className='underline'>
                    Sign in
                  </Text>
                </Link>
              </Text>
            </Flex>
            <label>
              <Text size={'2'} weight={'medium'}>
                Email
              </Text>
              <TextField.Root
                placeholder='Enter your email'
                size='3'
                mt={'2'}
                {...register('email')}
              >
                <TextField.Slot>
                  <EnvelopeIcon height='16' width='16' />
                </TextField.Slot>
              </TextField.Root>
              <Text size={'1'} color={'gray'} weight={'medium'}>
                {errors.email?.message}
              </Text>
            </label>
            <Box>
              <Flex align={'center'} pr={'1'} justify={'between'}>
                <Text size={'2'} weight={'medium'}>
                  Password
                </Text>
                <Text as={'span'} size='2' color={'gray'} className='underline'>
                  Forgot password?
                </Text>
              </Flex>
              <TextField.Root
                placeholder='Enter your password'
                size='3'
                mt={'2'}
                type='password'
                {...register('password')}
              >
                <TextField.Slot>
                  <LockClosedIcon height='16' width='16' />
                </TextField.Slot>
              </TextField.Root>
              <Text size={'1'} color={'gray'} weight={'medium'}>
                {errors.password?.message}
              </Text>
            </Box>
            <Text size={'1'} color={'gray'} weight={'medium'}>
              By joining, you agree to our{' '}
              <Text as={'span'} color={'gray'} className='underline'>
                Terms and Privacy
              </Text>
              .
            </Text>
            <Button type='submit' size={'3'}>
              Sign up
            </Button>
          </Flex>
        </Card>
      </Box>
    </form>
  )
}
