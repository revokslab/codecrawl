import { ArrowRightCircleIcon, HeartIcon } from '@heroicons/react/24/solid'
import { Button } from '@radix-ui/themes'
import { useNavigate } from '@tanstack/react-router'
import { SvgLogoBlack } from '../svgs'

export function CTA() {
  const navigate = useNavigate()

  return (
    <div className='w-full relative flex flex-col items-center isolate @container rounded-[2rem] bg-transparent overflow-hidden py-6 @lg:py-12 px-4'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6'>
        <div className='relative max-w-3xl mx-auto text-center'>
          <div className='inline-flex scale-150 items-center justify-center rounded-xl mb-6 relative'>
            <SvgLogoBlack className='h-10 w-10' />
            <HeartIcon className='absolute bottom-0 right-0 h-4 w-4 text-[var(--accent-9)] animate-wiggle' />
          </div>
          <h3 className='text-neutral-800 font-medium text-center text-[2rem] @lg:text-[3rem] tracking-tight leading-[1.08]'>
            Create Something!
          </h3>
          <p className='text-center text-neutral-600 font-medium text-base text-balance tracking-normal leading-normal mt-2'>
            Create great products by using Codecrawl API to power your LLM applications. Join many
            founders using it to code-related things...
          </p>
          <div className='mt-6 max-w-xs mx-auto sm:max-w-none sm:inline-flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4'>
            <Button
              variant='solid'
              size='3'
              className='cursor-pointer'
              onClick={() => navigate({ to: '/signin' })}
            >
              Get Started
              <ArrowRightCircleIcon className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
