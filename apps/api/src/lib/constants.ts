export const isProd = process.env.NODE_ENV === 'production'
export const BASE_URL = isProd ? 'https://api.revoks.dev' : 'http://localhost:4000'
