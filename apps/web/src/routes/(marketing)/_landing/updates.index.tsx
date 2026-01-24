import { MDXContent } from '@content-collections/mdx/react'
import { RssIcon } from '@heroicons/react/24/outline'
import { createFileRoute, Link } from '@tanstack/react-router'
import { allUpdates } from 'content-collections'
import { format } from 'date-fns'
import { ButtonLink } from '~/components/ui/button-link'
import { SvgGithubLogo } from '~/components/svgs'

export const Route = createFileRoute('/(marketing)/_landing/updates/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='relative flex flex-col gap-8 py-8'>
      <div>
        <h1 className='mt-5 text-3xl font-medium text-neutral-900 sm:text-4xl sm:leading-[1.15] text-left'>
          Updates
        </h1>
        <p className='mt-5 text-neutral-500 sm:text-lg'>
          All the latest updates, improvements, and fixes to Codecrawl
        </p>
      </div>
      <div className='flex w-fit items-center gap-2 space-x-2'>
        <ButtonLink href='https://github.com/Idee8/codecrawl' target='_blank'>
          <SvgGithubLogo className='w-4 h-4' />
        </ButtonLink>
        <ButtonLink href='/updates'>
          <RssIcon className='w-4 h-4' />
        </ButtonLink>
        <p className='text-sm text-neutral-500'>Subscribe to updates</p>
      </div>
      <div className='min-h-[50vh] border-t border-neutral-200 bg-gradient-to-b from-neutral-50'>
        <div className='mx-auto w-full px-3 max-w-screen-lg lg:px-4 xl:px-0'>
          {allUpdates.map((update) => (
            <div className='grid py-20 md:grid-cols-4 md:px-5 xl:px-0' key={update._meta.path}>
              <div className='sticky top-20 hidden self-start md:col-span-1 md:block'>
                <Link to={`/updates/$slug`} params={{ slug: update._meta.path }}>
                  <time
                    dateTime=''
                    className='text-neutral-500 transition-colors hover:text-neutral-800'
                  >
                    {format(update.date, 'MMMM d, yyyy')}
                  </time>
                </Link>
              </div>
              <div className='flex flex-col gap-6 md:col-span-3'>
                <Link to={`/updates/$slug`} params={{ slug: update._meta.path }}>
                  <img
                    src={update.image}
                    alt={update.title}
                    className='blur-0 aspect-video border border-neutral-200 object-cover md:rounded-2xl'
                  />
                </Link>
                <Link
                  to={`/updates/$slug`}
                  params={{ slug: update._meta.path }}
                  className='group mx-5 flex items-center space-x-3 md:mx-0'
                >
                  <time
                    dateTime={update.date}
                    className='text-sm text-neutral-500 transition-all group-hover:text-neutral-800 md:hidden'
                  >
                    {format(update.date, 'MMMM d, yyyy')}
                  </time>
                </Link>
                <Link
                  to={`/updates/$slug`}
                  params={{ slug: update._meta.path }}
                  className='mx-5 md:mx-0'
                >
                  <h2 className='font-display text-2xl font-medium tracking-tight text-neutral-800 hover:underline hover:decoration-1 hover:underline-offset-4 md:text-3xl'>
                    {update.title}
                  </h2>
                </Link>
                <article className='prose prose-neutral max-w-none transition-all prose-headings:relative prose-headings:scroll-mt-20 prose-headings:font-display prose-a:font-medium prose-a:text-neutral-500 prose-a:underline-offset-4 hover:prose-a:text-black prose-thead:text-lg mx-5 md:mx-0'>
                  <MDXContent code={update.content} />
                </article>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
