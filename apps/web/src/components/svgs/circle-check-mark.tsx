import type { SVGProps } from 'react'

export default function SvgCircleCheckMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width='1em' height='1em' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path opacity='0.12' fill='currentColor' d='M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20Z' />
      <path
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='m9 12 2 2 5-5m6 3c0 5.52-4.48 10-10 10-5.53 0-10-4.48-10-10C2 6.47 6.47 2 12 2c5.52 0 10 4.47 10 10Z'
      />
    </svg>
  )
}
