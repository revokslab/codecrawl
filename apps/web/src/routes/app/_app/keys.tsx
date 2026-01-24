import { Flex, Text } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'

import { seo } from '~/utils/seo'
import { KeysTable } from '~/components/keys-table'
import { CreateKeyModal } from '~/components/create-key-modal'

export const Route = createFileRoute('/app/_app/keys')({
  component: RouteComponent,
  head(_ctx) {
    return {
      meta: [...seo({ title: 'API Keys | Codecrawl' })],
    }
  },
})

function RouteComponent() {
  return (
    <Flex direction={'column'} gap={'4'}>
      <Flex justify={'between'} align={'center'}>
        <Flex direction={'column'} gap={'2'}>
          <Text size={'3'} weight={'bold'}>
            API Keys
          </Text>
          <Text size={'2'} color={'gray'} weight={'medium'}>
            Create an API key to use Codecrawl in your applications.
          </Text>
        </Flex>
        <CreateKeyModal />
      </Flex>
      <KeysTable />
    </Flex>
  )
}
