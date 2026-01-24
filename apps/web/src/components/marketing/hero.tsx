export function Hero() {
  return (
    <div className='flex flex-col justify-between mb-12'>
      <div className='flex flex-col gap-10 justify-center items-center'>
        <div className='flex flex-col gap-4 justify-center items-center'>
          <h2 className='md:text-5xl text-3xl font-semibold max-w-lg tracking-wide text-neutral-900 text-balance text-center'>
            Turn codebases into LLM-ready data
          </h2>
          <p className='text-neutral-600 font-medium max-w-sm text-balance text-center'>
            Power your AI apps with clean data collected from any codebases. It's also open source.
          </p>
        </div>
      </div>
    </div>
  )
}
