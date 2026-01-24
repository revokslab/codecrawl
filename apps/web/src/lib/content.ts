import { notFound } from '@tanstack/react-router'
import { allPosts, allUpdates } from 'content-collections'

export function findPostBySlug(slug: string) {
  const post = allPosts.find((post) => post._meta.path === slug)
  if (!post) {
    throw notFound()
  }
  return post
}

export function findUpdateBySlug(slug: string) {
  const update = allUpdates.find((update) => update._meta.path === slug)
  if (!update) {
    throw notFound()
  }
  return update
}

export function findPostsByCategory(category: string) {
  return allPosts.filter((post) => post.category === category)
}
