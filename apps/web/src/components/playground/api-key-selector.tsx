import { Flex, Text, Select } from '@radix-ui/themes'
import { useState, useEffect } from 'react'
import { useApiKeyStore } from '~/store/use-api-key-store'
import { useTeams } from '~/contexts/teams-context'

export function ApiKeySelector() {
  const { activeTeam, teams } = useTeams()
  const { selectedApiKey, setSelectedApiKey } = useApiKeyStore()
  const [isLoading, setIsLoading] = useState(false)

  // Get the available API keys from the active team
  const apiKeys = activeTeam?.apiKeys || []

  // If no key is selected but we have keys available, auto-select the first one
  useEffect(() => {
    if (!selectedApiKey && apiKeys.length > 0) {
      setSelectedApiKey(apiKeys[0].key)
    }
  }, [apiKeys, selectedApiKey, setSelectedApiKey])

  const handleSelectChange = (value: string) => {
    const selectedKey = apiKeys.find((k) => k.id === value)?.key || null
    setSelectedApiKey(selectedKey)
  }

  // No team keys available - show warning
  if (apiKeys.length === 0) {
    return (
      <Flex direction='column' gap='3'>
        <Text size='2' color='red' weight='medium'>
          No API keys available. Please create an API key in your team settings.
        </Text>
      </Flex>
    )
  }

  return (
    <Flex direction='column' gap='3'>
      <Flex direction='column' gap='1'>
        <Text size='2' weight='medium'>
          Select an API key from your team
        </Text>
        <Select.Root
          defaultValue={apiKeys.find((k) => k.key === selectedApiKey)?.id || apiKeys[0].id}
          onValueChange={handleSelectChange}
          disabled={isLoading}
        >
          <Select.Trigger placeholder='Select an API key' />
          <Select.Content>
            {apiKeys.map((key) => (
              <Select.Item key={key.id} value={key.id}>
                {key.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>
    </Flex>
  )
}
