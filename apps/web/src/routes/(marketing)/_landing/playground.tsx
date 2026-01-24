import { Flex, Text, Box } from '@radix-ui/themes'
import { Tabs } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import { FileTreeTab } from '~/components/playground/file-tree-tab'
import { SettingsTab } from '~/components/playground/settings-tab'
import { usePlaygroundSettingsStore } from '~/store/use-playground-settings'
import { LLMsTxtTab } from '~/components/playground/llmstxt-tab'

export const Route = createFileRoute('/(marketing)/_landing/playground')({
  component: RouteComponent,
})

function RouteComponent() {
  usePlaygroundSettingsStore()

  return (
    <Flex direction={'column'} gap={'4'} className='mt-4 md:mt-8'>
      <Flex justify={'between'} align={'center'}>
        <Flex direction={'column'} gap={'2'}>
          <Text size={'7'} weight={'medium'} className='text-neutral-800'>
            Playground
          </Text>
          <Text size={'3'} color={'gray'} weight={'medium'} className='text-neutral-500'>
            Try out Codecrawl in this visual playground
          </Text>
        </Flex>
      </Flex>
      <Flex direction={'column'} gap={'4'}>
        <div>
          <Tabs.Root defaultValue='llms' className='w-full !text-neutral-800'>
            <Tabs.List className='px-4 pt-4 bg-white border-b border-neutral-200'>
              <Tabs.Trigger value='llms' className='text-neutral-800'>
                LLMs.txt
              </Tabs.Trigger>
              <Tabs.Trigger value='filetree' className='text-neutral-800'>
                File Tree
              </Tabs.Trigger>
              <Tabs.Trigger value='settings' className='text-neutral-800'>
                Settings
              </Tabs.Trigger>
            </Tabs.List>

            <Box className='p-6 bg-white'>
              <Tabs.Content value='llms'>
                <LLMsTxtTab variant='marketing' />
              </Tabs.Content>

              <Tabs.Content value='filetree'>
                <FileTreeTab variant='marketing' />
              </Tabs.Content>

              <Tabs.Content value='settings'>
                <SettingsTab />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </div>
      </Flex>
    </Flex>
  )
}
