import { Box, Flex, Tabs, Text } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import { seo } from '~/utils/seo'
import { FileTreeTab } from '~/components/playground/file-tree-tab'
import { LLMsTxtTab } from '~/components/playground/llmstxt-tab'
import { SettingsTab } from '~/components/playground/settings-tab'
import { ApiKeySelector } from '~/components/playground/api-key-selector'

export const Route = createFileRoute('/app/_app/playground')({
  component: RouteComponent,
  head(ctx) {
    return {
      meta: [...seo({ title: 'Playground | Codecrawl' })],
    }
  },
})

function RouteComponent() {
  return (
    <Flex direction={'column'} gap={'4'}>
      <Flex justify={'between'} align={'center'}>
        <Flex direction={'column'} gap={'2'}>
          <Text size={'3'} weight={'bold'}>
            Playground
          </Text>
          <Text size={'2'} color={'gray'} weight={'medium'}>
            Try out Codecrawl with your team API keys
          </Text>
        </Flex>
      </Flex>

      <Flex direction='column' gap='2'>
        <ApiKeySelector />
      </Flex>

      <Flex direction={'column'} gap={'4'}>
        <Tabs.Root defaultValue='filetree'>
          <Tabs.List>
            <Tabs.Trigger value='filetree'>File Tree</Tabs.Trigger>
            <Tabs.Trigger value='llms'>LLMs.txt</Tabs.Trigger>
            <Tabs.Trigger value='settings'>Settings</Tabs.Trigger>
          </Tabs.List>

          <Box pt='3'>
            <Tabs.Content value='llms'>
              <LLMsTxtTab variant='app' />
            </Tabs.Content>

            <Tabs.Content value='filetree'>
              <FileTreeTab variant='app' />
            </Tabs.Content>

            <Tabs.Content value='settings'>
              <SettingsTab />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>
    </Flex>
  )
}
