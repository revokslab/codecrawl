import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.mdx',
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.string(),
    image: z.string(),
    category: z.string(),
  }),
  transform: async (post, ctx) => {
    const content = await compileMDX(ctx, post)
    return {
      ...post,
      content,
    }
  },
})

const updates = defineCollection({
  name: 'updates',
  directory: 'content/updates',
  include: '**/*.mdx',
  schema: (z) => ({
    title: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    authors: z.array(z.string()),
    image: z.string(),
  }),
  transform: async (post, ctx) => {
    const content = await compileMDX(ctx, post)
    return {
      ...post,
      content,
    }
  },
})

export default defineConfig({
  collections: [posts, updates],
})
