import { AlertDialog, Button, Flex } from '@radix-ui/themes'

export function LogoutConfirm({
  trigger,
  open,
  setOpen,
}: {
  trigger: React.ReactNode
  open: boolean
  setOpen: (open: boolean) => void
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Content maxWidth='450px'>
        <AlertDialog.Title>Logout</AlertDialog.Title>
        <AlertDialog.Description size='2'>Are you sure you want to logout?</AlertDialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <AlertDialog.Cancel>
            <Button variant='soft' color='gray'>
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant='solid' color='red'>
              Logout
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
