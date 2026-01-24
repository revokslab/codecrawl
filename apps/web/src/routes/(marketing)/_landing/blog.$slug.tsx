import { MDXContent } from '@content-collections/mdx/react'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { format } from 'date-fns'
import { findPostBySlug } from '~/lib/content'

export const Route = createFileRoute('/(marketing)/_landing/blog/$slug')({
  component: RouteComponent,
  loader: async ({ params: { slug } }) => findPostBySlug(slug),
})

function RouteComponent() {
  const post = Route.useLoaderData()
  const dt = useMemo(() => new Date(post.date), [])

  return (
    <article className='relative'>
      <div className='flex space-y-10 pb-10 flex-col items-center justify-center'>
        <header className='flex flex-col w-full items-center space-y-10 mt-4'>
          <h3 className='text-3xl w-full max-w-xl font-semibold text-balance text-neutral-900 tracking-tight !leading-[1.2]'>
            {post.title}
          </h3>
          <div className='flex justify-start gap-x-8 w-full max-w-xl text-sm'>
            <div className='flex flex-col gap-y-1'>
              <span className='text-gray-500 text-xs'>Published on</span>
              <time dateTime={dt.toISOString()} className='text-gray-700 font-medium'>
                {format(dt, 'MMMM dd, yyyy')}
              </time>
            </div>
            <div className='flex flex-col gap-y-1'>
              <span className='text-gray-500 text-xs'>Written by</span>
              <span className='text-gray-700 font-medium'>{post.author}</span>
            </div>
          </div>
          <div className='relative mt-10 group max-w-3xl'>
            <div className='relative p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm'>
              <img
                src={post.image}
                alt={post.title}
                width={1200}
                height={600}
                className='w-full h-full aspect-[2/1] object-fit sepia-[.15] saturate-50 rounded-xl pointer-events-none'
              />
            </div>
          </div>
        </header>
        <div className='prose prose-th:text-left prose-neutral max-w-xl w-full prose-pre:!bg-neutral-100'>
          <MDXContent code={post.content} />
        </div>
      </div>
    </article>
  )
}
