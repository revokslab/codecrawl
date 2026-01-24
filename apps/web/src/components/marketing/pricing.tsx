import { Button } from '@radix-ui/themes'
import { SvgCircleCheckMark } from '../svgs'
import { ArrowRightCircleIcon } from '@heroicons/react/24/solid'
import { useNavigate } from '@tanstack/react-router'

export function Pricing() {
  return (
    <div className='@container'>
      <div className='flex flex-col items-center max-w-3xl mx-auto'>
        <h2 className='font-medium @lg:text-[3rem] tracking-tight text-balance text-neutral-800 text-center text-[48px]'>
          Flexible Pricing
        </h2>
        <p
          className='text-base text-balance tracking-normal leading-normal mt-2 text-neutral-600
        text-center max-w-2xl'
        >
          Start free, scale as you grow.
        </p>
      </div>
      <div className='mx-auto mt-12 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3'>
        <PricingCard
          title='Free'
          price={0}
          planFor='500 free credits'
          to='/signup'
          features={['2 teams', '50 crawling repos', 'Low rate limits', '2 concurrent crawls']}
        />
        <PricingCard
          title='Starter'
          price={234}
          planFor='3,000 credits per month'
          to='/signup'
          features={['10 teams', '100 crawling repos', '5 concurrent crawls']}
        />
        <PricingCard
          title='Premium'
          price={339}
          planFor='10,000 credits per month'
          to='/signup'
          features={[
            'Unlimited teams',
            '300 crawling repos',
            '50 concurrent crawls',
            'Standard support',
          ]}
        />
      </div>
    </div>
  )
}

const PricingCard: React.FC<{
  title: string
  price: number
  planFor: string
  to: string
  features: string[]
}> = ({ title, price, planFor, to, features }) => {
  const navigate = useNavigate()
  return (
    <div className='group flex flex-1 rounded-2xl border-[1px] border-neutral-200 p-1 shadow-sm'>
      <div className='flex flex-1 flex-col justify-start gap-5 rounded-xl border-[1px] border-neutral-100 bg-neutral-50 p-5 text-left transition-all duration-300 group-hover:border-neutral-200'>
        <div className='flex flex-1 flex-col justify-start gap-5'>
          <div className='flex flex-col gap-3'>
            <div className='flex flex-row items-center justify-between'>
              <h2 className='text-xl font-semibold text-neutral-800'>{title}</h2>
            </div>
            <div className='flex flex-row items-center justify-between'>
              <p className='flex flex-row items-baseline font-medium'>
                <span className='text-sm text-gray-600'>$</span>
                <span className='ml-1 text-2xl font-bold text-neutral-900'>{price}</span>
                <span className='ml-1.5 text-sm font-medium text-gray-500'>/month</span>
              </p>
            </div>
            <p className='text-sm font-medium text-neutral-600'>{planFor}</p>
          </div>
          <div className='flex flex-col gap-3'>
            <p className='text-sm font-medium text-neutral-600'>What included?</p>
            <div className='grid grid-cols-1 flex-col gap-2 md:grid-cols-1'>
              {features.map((feature, idx) => (
                <div className='flex items-center gap-2.5' key={idx + feature}>
                  <SvgCircleCheckMark className='shrink-0 text-neutral-800 transition-all duration-300 group-hover:scale-110 group-hover:text-green-600' />
                  <p className='text-sm font-medium text-neutral-800'>{feature}</p>
                </div>
              ))}
            </div>
          </div>

          <div className='mt-1 flex flex-1 flex-col justify-end'>
            <div className='inline-flex'>
              <Button
                variant='solid'
                radius='large'
                className='cursor-pointer'
                onClick={() => navigate({ to: to })}
              >
                Get <span className='lowercase'>{title}</span>
                <ArrowRightCircleIcon className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
