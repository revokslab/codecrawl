import { KeyIcon, PlayCircleIcon } from '@heroicons/react/24/outline'
import { Avatar, DropdownMenu, Flex, Text } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'
import { useAuthContext } from '~/contexts/auth-context'
import { useTeams } from '~/contexts/teams-context'
export function Sidebar() {
  const { user } = useAuthContext()
  const { activeTeam } = useTeams()

  console.log(activeTeam)

  return (
    <Flex gap={'4'} direction={'column'} width={'250px'} height={'100%'} px={'4'} py={'5'}>
      <Flex direction={'column'} flexGrow={'1'}>
        <Flex direction={'column'} flexGrow={'1'}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Flex gap={'4'} align={'center'}>
                <Avatar fallback='PT' />
                <Flex align={'center'} justify={'between'} flexGrow={'1'}>
                  <Flex direction={'column'}>
                    <Text>{activeTeam?.name}</Text>
                    <Text size={'1'} color={'green'}>
                      Free Plan
                    </Text>
                  </Flex>
                  <DropdownMenu.TriggerIcon />
                </Flex>
              </Flex>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size={'2'}>
              <DropdownMenu.Item>Invite members</DropdownMenu.Item>
              <DropdownMenu.Item>Manage Team</DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item color='green'>Create Team</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <Flex direction={'column'} gap={'3'} pt={'7'}>
            <Text size={'2'} color='gray' className='uppercase'>
              Workspace
            </Text>
            <Flex gap={'2'} align={'center'}>
              <PlayCircleIcon width={'20'} height={'20'} className='text-[var(--gray-9)]' />
              <Link to={'/app/playground'}>Playground</Link>
            </Flex>
            <Flex gap={'2'} align={'center'}>
              <KeyIcon width={'20'} height={'20'} className='text-[var(--gray-9)]' />
              <Link to={'/app/keys'}>API Keys</Link>
            </Flex>
          </Flex>
        </Flex>
        <Flex>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Flex gap={'4'} align={'center'}>
                <Avatar fallback='I' variant='soft' radius='full' />
                <Flex direction={'column'}>
                  <Text>Account</Text>
                  <Text size={'1'} color='gray'>
                    {user?.email}
                  </Text>
                </Flex>
              </Flex>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size={'2'}>
              <DropdownMenu.Item>Profile</DropdownMenu.Item>
              <DropdownMenu.Item>Appearance</DropdownMenu.Item>
              <DropdownMenu.Separator />

              <DropdownMenu.Item color='red' asChild>
                <Link to={'/logout'}>Logout</Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>
    </Flex>
  )
}
