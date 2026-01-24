import { createFileRoute } from '@tanstack/react-router'
import { CTA } from '~/components/marketing/cta'
import { FAQ } from '~/components/marketing/faq'
import { Hero } from '~/components/marketing/hero'
import { Pricing } from '~/components/marketing/pricing'

export const Route = createFileRoute('/(marketing)/_landing/')({
  component: Home,
})

function Home() {
  return (
    <div className='max-w-3xl mx-auto py-0 sm:py-16'>
      <Hero />
      <Pricing />
      <hr className='border-t border-neutral-100 my-20' />
      <CTA />
      <hr className='border-t border-neutral-100 my-20' />
      <FAQ />
    </div>
  )
}
