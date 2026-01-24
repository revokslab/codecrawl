import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { BLOG_CATEGORIES } from '~/lib/constants'
import { findPostsByCategory } from '~/lib/content'
import { cn } from '~/utils/classnames'

export const Route = createFileRoute('/(marketing)/_landing/blog/c/$category')({
  component: RouteComponent,
  loader: async ({ params: { category } }) => findPostsByCategory(category),
})

function RouteComponent() {
  const posts = Route.useLoaderData()

  const mostLatestPost = useMemo(
    () => posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0],
    [posts]
  )
  const slicedPosts = useMemo(() => posts.slice(1), [posts])

  return (
    <div className='min-h-[70vh]'>
      <div className='space-y-10'>
        <div className='flex flex-col space-y-6'>
          <div className='flex flex-col space-y-4'>
            <p className='text-sm font-normal capitalize text-gray-600'>
              {mostLatestPost?.category}
            </p>
            <h1 className='text-balance text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800'>
              {mostLatestPost.category === 'product'
                ? 'Thoughts on product management.'
                : mostLatestPost.category === 'engineering'
                  ? 'Thoughts on Engineering.'
                  : 'Thoughts on Marketing.'}
            </h1>
          </div>
          <hr className='border-gray-100' />
        </div>
        <div className='flex flex-col space-y-14'>
          <div className='mx-auto grid grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none md:grid-cols-2 lg:grid-cols-3'>
            <Link
              to='/blog/$slug'
              key={mostLatestPost._meta.path}
              className='flex flex-col items-start col-span-full group'
              params={{ slug: mostLatestPost._meta.path }}
            >
              <div className='relative w-full grid lg:grid-cols-2 gap-4 lg:gap-8'>
                <img
                  src={mostLatestPost.image}
                  alt={mostLatestPost.title}
                  className='aspect-[2/1] w-full p-1.5 shadow-sm rounded-2xl bg-white object-cover border border-gray-200 saturate-50 sepia-[.15] pointer-events-none'
                />
                <div className='flex flex-col justify-center'>
                  <div className='flex items-center gap-x-4 text-xs'>
                    <time dateTime={mostLatestPost.date} className='text-gray-500'>
                      {format(new Date(mostLatestPost.date), 'MMM d, yyyy')}
                    </time>
                    <span className='relative z-10 capitalize rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600'>
                      {mostLatestPost.category}
                    </span>
                  </div>
                  <div className='relative'>
                    <h3 className='mt-3 text-xl font-semibold text-gray-900 group-hover:text-gray-600 transition-all duration-500'>
                      <p className='text-balance'>{mostLatestPost.title}</p>
                    </h3>
                    <p className='mt-5 text-base text-gray-600'>{mostLatestPost.summary}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          <div className='flex items-center w-full gap-4'>
            <div className='text-neutral-600 text-sm font-semibold uppercase'>Categories</div>
            <div className='h-px flex-1 bg-neutral-100' />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {BLOG_CATEGORIES.map((category) => (
              <Link
                to='/blog/c/$category'
                className='block group'
                key={category.slug}
                params={{ category: category.slug }}
              >
                <div className='relative rounded-2xl border shadow-sm border-gray-200 p-1 transition-all aspect-[2/1]'>
                  <div
                    className={cn(
                      'absolute inset-0 m-1 bg-gradient-to-r rounded-xl',
                      category.gradient
                    )}
                  />
                  <div className='absolute bottom-4 left-4'>
                    <div className='rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5'>
                      <h3 className='text-sm font-medium text-gray-600'>{category.name}</h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className='flex items-center w-full gap-4'>
            <div className='text-neutral-600 text-sm font-semibold uppercase'>Latest Posts</div>
            <div className='h-px flex-1 bg-neutral-100' />
          </div>

          <div className='mx-auto mt-16 grid grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none md:grid-cols-2 lg:grid-cols-3'>
            {slicedPosts.map((post) => (
              <Link
                to='/blog/$slug'
                key={post._meta.path}
                className='flex flex-col group items-start'
                params={{ slug: post._meta.path }}
              >
                <div className='relative w-full'>
                  <img
                    src={post.image}
                    alt={post.title}
                    className='aspect-[2/1] w-full saturate-0 rounded-2xl bg-white shadow-sm object-cover border border-gray-200 transition-all duration-500 group-hover:saturate-50 group-hover:sepia-[.15] p-1 pointer-events-none'
                  />
                </div>
                <div className='max-w-xl'>
                  <div className='mt-3 flex items-center gap-x-4 text-xs'>
                    <time dateTime={post.date} className='text-gray-500'>
                      {format(new Date(post.date), 'MMM d, yyyy')}
                    </time>
                  </div>
                  <div className='group relative'>
                    <h3 className='mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600 transition-all duration-500'>
                      {post.title}
                    </h3>
                    <p className='mt-5 line-clamp-3 text-sm/6 text-gray-600'>{post.summary}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
