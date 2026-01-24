/// <reference types="vite/client" />
import { Theme } from '@radix-ui/themes'
import { QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Toaster } from 'sonner'

import { DefaultCatchBoundary } from '~/components/catch-boundary'
import { NotFound } from '~/components/not-found'
import { queryClient } from '~/lib/query-client'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: 'Codecrawl',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning className='font-sans antialiased'>
        <QueryClientProvider client={queryClient}>
          <Theme
            accentColor='tomato'
            radius='large'
            grayColor='slate'
            panelBackground='solid'
            appearance='dark'
          >
            <main className='flex min-h-screen flex-col'>{children}</main>
            <Scripts />
            <Toaster />
          </Theme>
        </QueryClientProvider>
      </body>
    </html>
  )
}
