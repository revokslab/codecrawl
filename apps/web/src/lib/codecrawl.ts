import Codecrawl from '@codecrawl/sdk'

export const codecrawl = new Codecrawl({
  apiKey: import.meta.env.VITE_CODECRAWL_API_KEY,
  apiUrl: import.meta.env.VITE_CODECRAWL_API_URL,
})
