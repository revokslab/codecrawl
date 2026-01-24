import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/_app/')({
  beforeLoad: async () => {
    throw redirect({
      to: '/app/playground',
    })
  },
})
