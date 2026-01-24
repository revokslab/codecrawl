import { Link } from '@tanstack/react-router'

import { SvgLogoBlack, SvgGithubLogo, SvgXLogo, SvgLinkedInLogo } from '../svgs'

export function Footer() {
  return (
    <div className='mx-auto w-full px-3 relative z-10 overflow-hidden border-neutral-200 py-16 backdrop-blur-lg md:rounded-t-2xl max-w-screen-lg border-0 bg-transparent lg:px-4 xl:px-0'>
      <footer>
        <div className='xl:grid xl:grid-cols-3 xl:gap-8'>
          <div className='flex flex-col gap-6'>
            <div className='grow'>
              <SvgLogoBlack className='w-10 h-10' />
            </div>
            <div className='flex items-center gap-3'>
              <a href='https://github.com/codecrawl' target='_blank' rel='noopener noreferrer'>
                <SvgGithubLogo className='w-5 h-5' />
              </a>
              <a
                href='https://www.linkedin.com/company/codecrawl'
                target='_blank'
                rel='noopener noreferrer'
              >
                <SvgLinkedInLogo className='w-5 h-5' />
              </a>
              <a href='https://x.com/codecrawl' target='_blank' rel='noopener noreferrer'>
                <SvgXLogo className='w-5 h-5' />
              </a>
            </div>
          </div>
          <div className='mt-16 grid grid-cols-2 gap-4 xl:col-span-2 xl:mt-0 text-neutral-700'>
            <div className='md:grid md:grid-cols-2'>
              <div className='space-y-2'>
                <h3 className='text-sm font-medium text-neutral-900'>Product</h3>
                <ul className='flex flex-col mt-2.5 gap-2.5'>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Get started</Link>
                  </li>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Pricing</Link>
                  </li>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>API</Link>
                  </li>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>FAQ</Link>
                  </li>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Use Cases</Link>
                  </li>
                </ul>
              </div>
              <div className='space-y-2'>
                <h3 className='text-sm font-medium text-neutral-900'>Support</h3>
                <ul className='flex flex-col mt-2.5 gap-2.5'>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Contact</Link>
                  </li>

                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Docs</Link>
                  </li>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Blog</Link>
                  </li>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Definitions</Link>
                  </li>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Stories</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className='md:grid md:grid-cols-2'>
              <div className='space-y-2'>
                <h3 className='text-sm font-medium text-neutral-900'>Tools</h3>
                <ul className='flex flex-col mt-2.5 gap-2.5'>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>File Structure</Link>
                  </li>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Explorer</Link>
                  </li>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Auto-Docs</Link>
                  </li>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Search</Link>
                  </li>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Summarizer</Link>
                  </li>
                </ul>
              </div>
              <div className='space-y-2'>
                <h3 className='text-sm font-medium text-neutral-900'>Legal</h3>
                <ul className='flex flex-col mt-2.5 gap-2.5'>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Terms</Link>
                  </li>
                  <li className='text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75'>
                    <Link to='/'>Privacy</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-12 grid grid-cols-1 items-center gap-8 sm:grid-cols-3 text-neutral-500'>
          <p className='text-sm flex justify-start'>&copy; 2025 Codecrawl</p>
          <div className='flex justify-center' />
          <p className='text-sm flex justify-end'>Idee8 Agency, Inc.</p>
        </div>
      </footer>
    </div>
  )
}
