import { ArrowTurnDownLeftIcon } from '@heroicons/react/24/outline'

export function Hero() {
  return (
    <div className='custom-container space-y-12 pt-16 min-h-screen flex flex-col justify-between'>
      <div className='flex flex-col gap-10 justify-center items-center'>
        <div className='flex flex-col gap-4 justify-center items-center'>
          <h2 className='md:text-5xl text-3xl font-semibold max-w-lg tracking-wide text-neutral-900 text-balance text-center'>
            Turn codebases into LLM-ready data
          </h2>
          <p className='text-neutral-600 font-medium max-w-sm text-balance text-center'>
            Power your AI apps with clean data collected from any codebases. It's also open source.
          </p>
        </div>
        <form className='flex bg-neutral-50 border-neutral-200 border-2 shadow rounded-2xl px-3.5 py-1.5 flex-row gap-4 justify-center items-center'>
          <input
            type='text'
            placeholder='https://github.com/Idee8/codecrawl'
            className='w-full border-none bg-transparent outline-none text-neutral-900 placeholder:text-neutral-500 p-2'
          />
          <ArrowTurnDownLeftIcon className='w-6 h-6 text-neutral-900' />
        </form>
      </div>
    </div>
  )
}
