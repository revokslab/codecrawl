import { MDXContent } from '@content-collections/mdx/react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { findUpdateBySlug } from '~/lib/content'

export const Route = createFileRoute('/(marketing)/_landing/updates/$slug')({
  component: RouteComponent,
  loader: async ({ params }) => findUpdateBySlug(params.slug),
})

function RouteComponent() {
  const update = Route.useLoaderData()
  return (
    <div className='relative flex flex-col gap-8'>
      <div className='min-h-[50vh]'>
        <div className='mx-auto w-full px-3 max-w-screen-lg lg:px-4 xl:px-0'>
          <div className='grid py-20 md:grid-cols-4 md:px-5 xl:px-0'>
            <div className='sticky top-20 hidden self-start md:col-span-1 md:block'>
              <Link
                to='/updates'
                className='flex items-center gap-2 font-medium text-sm text-neutral-500 transition-colors hover:text-neutral-800'
              >
                <ArrowLeftIcon className='w-4 h-4' />
                Back to updates
              </Link>
            </div>
            <div className='flex flex-col gap-6 md:col-span-3'>
              <Link to='/updates'>
                <img
                  src={update.image}
                  alt={update.title}
                  className='blur-0 aspect-video border border-neutral-200 object-cover md:rounded-2xl'
                />
              </Link>
              <Link to='/updates' className='group mx-5 flex items-center space-x-3 md:mx-0'>
                <time
                  dateTime=''
                  className='text-sm text-neutral-500 transition-all group-hover:text-neutral-800 md:hidden'
                >
                  {format(update.date, 'MMMM d, yyyy')}
                </time>
              </Link>
              <div className='flex items-center gap-2 text-sm text-neutral-500'>
                Written by{' '}
                <span className='font-medium text-neutral-500 transition-colors hover:text-neutral-800'>
                  {update.authors.join(', ')}
                </span>
              </div>
              <Link to='/updates' className='mx-5 md:mx-0'>
                <h2 className='font-display text-2xl font-medium tracking-tight text-neutral-800 hover:underline hover:decoration-1 hover:underline-offset-4 md:text-3xl'>
                  {update.title}
                </h2>
              </Link>
              <article className='prose prose-neutral max-w-none transition-all prose-headings:relative prose-headings:scroll-mt-20 prose-headings:font-display prose-a:font-medium prose-a:text-neutral-500 prose-a:underline-offset-4 hover:prose-a:text-black prose-thead:text-lg mx-5 md:mx-0'>
                <MDXContent code={update.content} />
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
