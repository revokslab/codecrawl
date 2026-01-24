import { Flex } from '@radix-ui/themes'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Footer } from '~/components/marketing/footer'
import { Header } from '~/components/marketing/header'


export const Route = createFileRoute('/(marketing)/_landing')({
  component: RouteComponent,
})

function RouteComponent() {
  const [stars, setStars] = useState(0)

  useEffect(() => {
    fetch(`https://api.github.com/repos/revokslab/codecrawl`)
      .then(response => response.json() as Promise<{ stargazers_count: number }>)
      .then(data => setStars(data.stargazers_count))
  }, [])

  return (
    <Flex direction={'column'} height={'100%'} flexGrow={'1'} style={{ backgroundColor: 'white' }}>
      <Header stars={stars}  />
      <div className='custom-container space-y-12 pt-16 min-h-screen flex flex-col justify-between'>
        <main className='flex-1'>
          <Outlet />
        </main>
        <Footer />
      </div>
    </Flex>
  )
}
