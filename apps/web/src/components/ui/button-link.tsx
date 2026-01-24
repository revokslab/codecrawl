interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
  className?: string
}

export function ButtonLink({ children, className, href, ...props }: ButtonLinkProps) {
  return (
    <a
      href={href}
      className='rounded-lg mx-auto max-w-fit border py-2 text-sm font-medium shadow-sm transition-all hover:ring-4 hover:ring-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:hover:ring-0 disabled:border-neutral-200 border-neutral-200 bg-white hover:border-neutral-400 hover:text-neutral-800 text-neutral-500 px-2'
      {...props}
    >
      {children}
    </a>
  )
}
