export const BLOG_CATEGORIES = [
  {
    name: 'Marketing',
    slug: 'marketing',
    gradient: 'from-blue-50 to-blue-100',
  },
  {
    name: 'Product',
    slug: 'product',
    gradient: 'from-green-50 to-green-100',
  },
  {
    name: 'Engineering',
    slug: 'engineering',
    gradient: 'from-purple-50 to-purple-100',
  },
]

export const API_BASE_URL = 'http://localhost:4000/v1'
export const isServer = typeof window === 'undefined'
export const loginNextPathKey = '@code/next'
