import { createStart } from '@tanstack/react-start'

declare module '@tanstack/react-start' {
  interface Register {
    server: {
      requestContext: {
        fromFetch: boolean
        request?: Request
      }
    }
  }
}

export const startInstance = createStart(() => {
  return {
    defaultSsr: true,
  }
})

startInstance.createMiddleware().server(({ next, request }) => {
  return next({
    context: {
      fromStartInstanceMw: true,
      request, // Pass the request to context for cookie forwarding
    },
  })
})
