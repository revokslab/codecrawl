import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { fallback } from '@tanstack/zod-adapter';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { SvgLogo } from '~/components/svgs';
import { toast } from '~/components/ui/toast';
import { API_BASE_URL } from '~/lib/constants';
import { useTokenStore } from '~/store/use-token-store';

const authSearchSchema = z.object({
  next: fallback(z.string().optional(), ''),
  error: fallback(z.string().optional(), ''),
  accessToken: fallback(z.string().optional(), ''),
  refreshToken: fallback(z.string().optional(), ''),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export const Route = createFileRoute('/(auth)/_auth/signin')({
  component: RouteComponent,
  validateSearch: authSearchSchema,
});

function RouteComponent() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({ resolver: zodResolver(loginSchema) });
  const router = useRouter();
  const { mutateAsync } = useMutation({
    mutationKey: ['login'],
    mutationFn: async (values: LoginSchemaType) => {
      return await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      }).then((res) => res.json());
    },
    onSuccess: (data) => {
      if (data?.error) {
        toast({
          title: 'Error',
          description: data.error,
          button: {
            label: 'Close',
            onClick: () => {},
          },
        });
      } else {
        toast({
          title: 'Success',
          description: 'Login successful',
          button: {
            label: 'Close',
            onClick: () => {},
          },
        });
        useTokenStore.getState().setTokens({
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
        });
        router.navigate({ to: '/app/playground' });
      }
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Login failed',
        button: {
          label: 'Close',
          onClick: () => {},
        },
      });
    },
  });
  const onSubmit: SubmitHandler<LoginSchemaType> = async (values) =>
    await mutateAsync(values);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box className="max-w-lg">
        <Card size="1" className="p-4" variant="classic">
          <Flex direction="column" gap="5" p={'4'}>
            <Flex direction="column" gap="2">
              <Avatar fallback={<SvgLogo />} color="gray" mb={'4'} />
              <Text size={'5'} weight={'medium'}>
                Sign in to your account
              </Text>
              <Text size={'2'} color={'gray'}>
                No account?{' '}
                <Link to="/signup">
                  <Text as={'span'} color={'gray'} className="underline">
                    Sign up for a new account
                  </Text>
                </Link>
              </Text>
            </Flex>
            <label>
              <Text size={'2'} weight={'medium'}>
                Email
              </Text>
              <TextField.Root
                placeholder="Enter your email"
                size="3"
                mt={'2'}
                {...register('email', { required: 'Email is required' })}
              >
                <TextField.Slot>
                  <EnvelopeIcon height="16" width="16" />
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
                <Text as={'span'} size="2" color={'gray'} className="underline">
                  Forgot password?
                </Text>
              </Flex>
              <TextField.Root
                placeholder="Enter your password"
                size="3"
                mt={'2'}
                type="password"
                {...register('password', { required: 'Password is required' })}
              >
                <TextField.Slot>
                  <LockClosedIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>
              <Text size={'1'} color={'gray'} weight={'medium'}>
                {errors.password?.message}
              </Text>
            </Box>
            <Button type="submit" size={'3'}>
              Sign in
            </Button>
          </Flex>
        </Card>
      </Box>
    </form>
  );
}
