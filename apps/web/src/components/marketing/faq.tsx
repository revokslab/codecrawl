import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'

export function FAQ() {
  return (
    <div className='mt-8 max-w-[390px] lg:max-w-6xl @container px-[var(--page-px)] w-full mx-auto flex flex-col items-center'>
      <div className='flex flex-col items-center'>
        <h1 className='text-neutral-800 font-medium text-center text-[2.1rem] @lg:text-[3rem] tracking-tight leading-[1.08]'>
          Frequently Asked
        </h1>
        <p className='text-center text-base text-balance tracking-normal text-neutral-600 leading-normal mt-2'>
          Here are some of the most common questions we get asked.
        </p>
      </div>
      <div className='w-full max-w-[42rem] px-4 mt-8'>
        <Accordion type='single' collapsible>
          <AccordionItem value='item-1'>
            <AccordionTrigger className='text-neutral-800 text-base'>
              What is Codecrawl?
            </AccordionTrigger>
            <AccordionContent className='text-neutral-600'>
              Codecrawl turns entire codebases into clean, LLM-ready markdown or structured data.
              Semantic search, file trees and extract the repositories with a single API. Ideal for
              AI companies looking to empower their LLM applications with code data.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-2'>
            <AccordionTrigger className='text-neutral-800 text-base'>
              Who can benefit from Codecrawl?
            </AccordionTrigger>
            <AccordionContent className='text-neutral-600'>
              Codecrawl is tailored for LLM engineers, data scientists, AI researchers, and
              developers looking to harness code data for training machine learning models, market
              research, content aggregation, and more. It simplifies the data preparation process,
              allowing professionals to focus on insights and model development.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-3'>
            <AccordionTrigger className='text-neutral-800 text-base'>
              Is Codecrawl Open-Source?
            </AccordionTrigger>
            <AccordionContent className='text-neutral-600'>
              Yes, it is. You can check out the repository on GitHub.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-4'>
            <AccordionTrigger className='text-neutral-800 text-base'>
              How does Codecrawl work?
            </AccordionTrigger>
            <AccordionContent className='text-neutral-600'>
              Codecrawl is a tool that helps you find the best code for your project.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-5'>
            <AccordionTrigger className='text-neutral-800 text-base'>
              Where can I find my API Key?
            </AccordionTrigger>
            <AccordionContent className='text-neutral-600'>
              Click on the dashboard button on the top navigation menu when logged in and you will
              find your API key in the main screen and under API Keys.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-6'>
            <AccordionTrigger className='text-neutral-800 text-base'>
              Is Codecrawl free?
            </AccordionTrigger>
            <AccordionContent className='text-neutral-600'>
              Codecrawl is free for the first 500 repositories (500 free credits). After that, you
              can upgrade to our Standard or Growth plans for more credits and higher rate limits.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-7'>
            <AccordionTrigger className='text-neutral-800 text-base'>
              How do I pay for Codecrawl?
            </AccordionTrigger>
            <AccordionContent className='text-neutral-600'>
              We accept payments through Stripe which accepts most major credit cards, debit cards,
              and PayPal.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-8'>
            <AccordionTrigger className='text-neutral-800 text-base'>
              Is Codecrawl suitable for large-scale projects?
            </AccordionTrigger>
            <AccordionContent className='text-neutral-600'>
              Absolutely. Codecrawl offers various pricing plans, including a Scale plan that
              supports crawling of millions of repositories. With features like caching and
              scheduled syncs, it's designed to efficiently handle large-scale data scraping and
              continuous updates, making it ideal for enterprises and large projects.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
