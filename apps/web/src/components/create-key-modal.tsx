'use client'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Dialog, Button, Flex, TextField, Text } from '@radix-ui/themes'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'

import { useTeams } from '~/contexts/teams-context'
import { mutationFnHelper } from '~/lib/mutation-fn'
import { toast } from '~/components/ui/toast'

export function CreateKeyModal() {
  const [open, setOpen] = useState(false)
  const { activeTeam } = useTeams()
  const navigate = useNavigate()

  const { mutateAsync } = useMutation({
    mutationFn: (variables: { name: string; teamId: string }) =>
      mutationFnHelper({
        endpoint: 'users/keys',
        data: variables,
        method: 'POST',
      }),
    onSuccess: (data) => {
      setOpen(false)
      toast({
        title: 'Key created',
        description: 'Your key has been created',
        button: {
          label: 'Copy',
          onClick: () => {
            navigator.clipboard.writeText(data.key)
          },
        },
      })
    },
    onError: (error) => {
      toast({
        title: 'Failed to create key',
        description: 'Please try again',
        button: {
          label: 'Close',
          onClick: () => {},
        },
      })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<{ name: string }>()

  const onSubmit: SubmitHandler<{ name: string }> = async (values) => {
    if (!activeTeam) {
      toast({
        title: 'No active team selected',
        description: 'Please select a team to create a key',
        button: {
          label: 'Select Team',
          onClick: () => {
            navigate({ to: '/app/keys' })
          },
        },
      })
      return
    }
    await mutateAsync({ name: values.name, teamId: activeTeam.id })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button>
          <PlusIcon className='w-4 h-4' /> Create Key
        </Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth='450px'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Title>New Key</Dialog.Title>
          <Dialog.Description size='2' mb='4'>
            Create a new API key to use Codecrawl in your applications.
          </Dialog.Description>

          <Flex direction='column' gap='3'>
            <label>
              <Text as='div' size='2' mb='1' weight='bold'>
                Name
              </Text>
              <Flex gap='2'>
                <TextField.Root
                  {...register('name')}
                  placeholder='My Key'
                  className='flex-1'
                  onChange={() => {
                    if (errors.name) {
                      clearErrors('name')
                    }
                  }}
                />
              </Flex>
              <Text size='2' color='gray' mt='1'>
                {errors.name?.message}
              </Text>
            </label>
          </Flex>

          <Flex gap='3' mt='4' justify='end'>
            <Dialog.Close>
              <Button variant='soft' color='gray'>
                Cancel
              </Button>
            </Dialog.Close>
            <Button type='submit'>Create</Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}
