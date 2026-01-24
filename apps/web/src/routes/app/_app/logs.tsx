import { Flex, Text } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import { seo } from '~/utils/seo'

export const Route = createFileRoute('/app/_app/logs')({
  component: RouteComponent,
  head(ctx) {
    return {
      meta: [...seo({ title: 'Logs | Codecrawl' })],
    }
  },
})

function RouteComponent() {
  return (
    <Flex direction={'column'} gap={'4'}>
      <Text size={'3'} weight={'bold'}>
        Logs
      </Text>
    </Flex>
  )
}
