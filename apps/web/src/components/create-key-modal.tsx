'use client'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'

export function CreateKeyModal() {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<{ name: string }>()

  const onSubmit: SubmitHandler<{ name: string }> = async (values) => {}

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
