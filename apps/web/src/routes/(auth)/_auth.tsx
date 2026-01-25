import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-background to-muted/30 p-4'>
      <Outlet />
    </div>
  )
}
