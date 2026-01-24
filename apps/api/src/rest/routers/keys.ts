import { createRouter } from '~/utils'

const keysRouter = createRouter()

keysRouter.get('/', (c) => {
  return c.json({
    message: 'Hello World',
  })
})

export { keysRouter }
