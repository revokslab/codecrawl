import { format } from 'date-fns'
import { EyeSlashIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button, Text, Table, Flex, Dialog, TextField } from '@radix-ui/themes'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useCopyToClipboard } from 'usehooks-ts'
import { toast } from 'sonner'

import { mutationFnHelper } from '~/lib/mutation-fn'
import { queryClient } from '~/lib/query-client'

export function KeysTable() {
  const { data, isLoading } = useQuery<{
    keys: { id: string; name: string; key: string; createdAt: string }[]
  }>({
    queryKey: ['users/keys'],
  })
  const { mutateAsync: deleteKey } = useMutation({
    mutationFn: (keyId: string) =>
      mutationFnHelper({
        endpoint: `users/keys/${keyId}`,
        method: 'DELETE',
        data: { keyId },
      }),
    onSuccess: () => {
      toast.success('Key deleted')
      queryClient.invalidateQueries({ queryKey: ['users/keys'] })
    },
    onError: () => {
      toast.error('Failed to delete key')
    },
  })
  const [copiedText, copy] = useCopyToClipboard()

  const handleCopy = (text: string) => () => {
    copy(text)
      .then(() => {
        console.log('Copied to clipboard', copiedText)
        toast.success('Copied to clipboard')
      })
      .catch((error) => {
        console.log(error)
        toast.error('Failed to copy')
      })
  }

  if (!data || isLoading) return null

  const isDeleteDisabled = data.keys.length === 1

  return (
    <Table.Root variant={'surface'}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell align={'center'}>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell align={'center'}>API Key</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell align={'center'}>Created</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell align={'center'}>Actions</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {data.keys.map((key) => (
          <Table.Row key={key.id}>
            <Table.RowHeaderCell align={'center'}>{key.name}</Table.RowHeaderCell>
            <Dialog.Root>
              <Dialog.Trigger>
                <Table.RowHeaderCell className='flex justify-evenly items-center'>
                  <span>
                    {key.key.slice(0, 6)}**********{key.key.slice(-6)}
                  </span>
                  <span>
                    <EyeSlashIcon className='w-4 h-4' />
                  </span>
                </Table.RowHeaderCell>
              </Dialog.Trigger>

              <Dialog.Content maxWidth='450px'>
                <Dialog.Title>View API Key</Dialog.Title>
                <Dialog.Description size='2' mb='4'>
                  Your API key is displayed below.
                </Dialog.Description>

                <Flex direction='column' gap='3'>
                  <label>
                    <Text as='div' size='2' mb='1' weight='bold'>
                      API Key
                    </Text>
                    <Flex gap='2'>
                      <TextField.Root defaultValue={key.key} readOnly className='flex-1' />
                    </Flex>
                  </label>
                </Flex>

                <Flex gap='3' mt='4' justify='end'>
                  <Button
                    variant='soft'
                    onClick={handleCopy(key.key)}
                    aria-label='Copy API key'
                    tabIndex={0}
                  >
                    Copy
                  </Button>
                  <Dialog.Close>
                    <Button variant='soft' color='gray'>
                      Close
                    </Button>
                  </Dialog.Close>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>

            <Table.Cell align={'center'}>
              <Text size={'2'} color={'gray'} weight={'medium'}>
                {format(new Date(key.createdAt), 'MMM d, yyyy')}
              </Text>
            </Table.Cell>
            <Table.Cell align={'center'}>
              <Button
                variant={'ghost'}
                onClick={() => deleteKey(key.id)}
                disabled={isDeleteDisabled}
              >
                <TrashIcon className='w-4 h-4' />
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
