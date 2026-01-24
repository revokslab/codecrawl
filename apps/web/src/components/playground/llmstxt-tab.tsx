import { Button, Flex, Text, TextArea, TextField } from '@radix-ui/themes'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { Link } from '@tanstack/react-router'
import { cn } from '~/utils/classnames'

import { CodecrawlService } from '~/lib/codecrawl-service'
import { usePlaygroundSettingsStore } from '~/store/use-playground-settings'

export interface LLMsTxtTabProps {
  variant: 'marketing' | 'app'
}

export function LLMsTxtTab({ variant }: LLMsTxtTabProps) {
  const [llmstxt, setLLMsTxt] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const { setGithubUrl, githubUrl, getCrawlOptions } = usePlaygroundSettingsStore()
  const [, copy] = useCopyToClipboard()

  const isMarketing = variant === 'marketing'

  // Marketing API instance and request state
  const {
    generateLLMsTxt: generateLLMsTxtMarketing,
    hasRemainingRequests,
    remainingRequests,
  } = CodecrawlService.useMarketingInstance()

  // Authenticated API instance creator
  const getAuthenticatedInstance = CodecrawlService.useAuthenticatedInstance

  const handleGenerate = async () => {
    setIsFetching(true)
    try {
      if (isMarketing) {
        const response = await generateLLMsTxtMarketing(githubUrl, {
          showFullText: true,
          ...getCrawlOptions(),
        })
        if ('data' in response && response.success) {
          setLLMsTxt(response.data.llmstxt)
        } else {
          toast.error(response.error || 'Failed to generate LLMs.txt')
          setLLMsTxt(null)
        }
      } else {
        // App variant
        const instance = getAuthenticatedInstance()
        const response = await instance.generateLLMsTxt(githubUrl, {
          showFullText: true,
          ...getCrawlOptions(),
        })
        if ('data' in response && response.success) {
          setLLMsTxt(response.data.llmstxt)
        } else {
          toast.error(response.error || 'Failed to generate LLMs.txt')
          setLLMsTxt(null)
        }
      }
    } catch (error) {
      console.error('Error generating LLMs.txt:', error)
      toast.error('An unexpected error occurred.')
      setLLMsTxt(null)
    } finally {
      setIsFetching(false)
    }
  }

  const copyLLMsTxt = () => {
    if (!llmstxt) return
    copy(llmstxt)
      .then(() => {
        toast.success('LLMs.txt copied to clipboard')
      })
      .catch(() => {
        toast.error('Failed to copy LLMs.txt to clipboard')
      })
  }

  // Define button styles conditionally based on variant
  const generateButtonClass = isMarketing
    ? cn(
        'h-9 rounded-[10px] text-sm font-medium flex items-center transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 bg-[#36322F] text-[#fff] hover:bg-[#4a4542] disabled:bg-[#8c8885] disabled:hover:bg-[#8c8885] [box-shadow:inset_0px_-2.108433723449707px_0px_0px_#171310,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(58,_33,_8,_58%)] hover:translate-y-[1px] hover:scale-[0.98] hover:[box-shadow:inset_0px_-1px_0px_0px_#171310,_0px_1px_3px_0px_rgba(58,_33,_8,_40%)] active:translate-y-[2px] active:scale-[0.97] active:[box-shadow:inset_0px_1px_1px_0px_#171310,_0px_1px_2px_0px_rgba(58,_33,_8,_30%)] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100 px-4 py-2'
      )
    : undefined // Use Radix Button for app variant

  const copyButtonClass = isMarketing
    ? 'p-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors'
    : undefined // Use Radix Button for app variant

  const signupButtonClass = isMarketing
    ? cn(
        'h-9 rounded-[10px] text-sm font-medium flex items-center justify-center transition-all duration-200 bg-[#36322F] text-[#fff] hover:bg-[#4a4542] [box-shadow:inset_0px_-2.108433723449707px_0px_0px_#171310,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(58,_33,_8,_58%)] hover:translate-y-[1px] hover:scale-[0.98] px-4 py-2'
      )
    : undefined

  return (
    <div className={isMarketing ? 'text-neutral-900' : ''}>
      <Flex direction='column' gap='3'>
        <label>
          <Text
            as='div'
            size='2'
            mb='1'
            weight='bold'
            className={isMarketing ? 'text-neutral-900' : ''}
          >
            Github URL
          </Text>
          <Flex gap='2'>
            <TextField.Root
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              size={isMarketing ? '3' : '2'}
              className={cn('flex-1', {
                '!text-neutral-900 !border-neutral-200 !bg-transparent !placeholder:text-neutral-500':
                  isMarketing,
              })}
              placeholder='https://github.com/username/repo'
            />
            {isMarketing ? (
              <button
                type='button'
                className={generateButtonClass}
                disabled={isFetching || !hasRemainingRequests}
                onClick={handleGenerate}
              >
                {isFetching ? 'Generating...' : 'Generate'}
              </button>
            ) : (
              <Button variant='solid' disabled={isFetching} onClick={handleGenerate}>
                {isFetching ? 'Generating...' : 'Generate'}
              </Button>
            )}
          </Flex>
        </label>
      </Flex>

      {/* Show request limits for marketing variant */}
      {isMarketing && (
        <Flex
          direction='row'
          justify='between'
          align='center'
          className='mt-2 rounded-lg bg-neutral-50 p-3 border border-neutral-200'
        >
          <Text
            size='2'
            className={cn(remainingRequests > 0 ? 'text-neutral-600' : 'text-red-600')}
            weight='medium'
          >
            {remainingRequests > 0
              ? `Remaining requests: ${remainingRequests}`
              : 'You have reached the maximum number of requests'}
          </Text>
          {remainingRequests === 0 && (
            <Link to='/signup' className='no-underline'>
              <button type='button' className={signupButtonClass}>
                Sign up for free
              </button>
            </Link>
          )}
        </Flex>
      )}

      <Flex direction='column' gap='3' className='mt-4'>
        {!!llmstxt && (
          <div className='flex justify-end'>
            {isMarketing ? (
              <button type='button' className={copyButtonClass} onClick={copyLLMsTxt}>
                <ClipboardDocumentIcon className='w-4 h-4 text-neutral-900' />
              </button>
            ) : (
              <Button variant='outline' onClick={copyLLMsTxt}>
                <ClipboardDocumentIcon className='w-4 h-4' />
              </Button>
            )}
          </div>
        )}
        <TextArea
          value={llmstxt ?? ''} // Ensure value is not null
          className={cn(
            'mt-4 h-[400px] resize-none font-mono', // Common classes
            isMarketing
              ? '!text-neutral-900 bg-neutral-50 !placeholder:text-neutral-500 p-4 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent'
              : '' // App specific classes (Radix default or others)
          )}
          rows={20}
          readOnly
          placeholder='LLMs.txt will appear here'
        />
      </Flex>
    </div>
  )
}
