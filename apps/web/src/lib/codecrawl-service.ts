import Codecrawl, {
  type CrawlOptions,
  type GenerateLLMsTextParams,
} from '@codecrawl/sdk';
import { usePlaygroundRequestsStore } from '~/store/use-playground-requests';
import { useApiKeyStore } from '~/store/use-api-key-store';
import { toast } from 'sonner';

// Default instance using API keys from environment
const defaultCodecrawl = new Codecrawl({
  apiKey: import.meta.env.VITE_CODECRAWL_API_KEY,
  apiUrl: import.meta.env.VITE_CODECRAWL_API_URL,
});

// Create a new instance with custom API key
const createCodecrawlInstance = (apiKey: string) => {
  return new Codecrawl({
    apiKey,
    apiUrl: import.meta.env.VITE_CODECRAWL_API_URL,
  });
};

export const CodecrawlService = {
  // For authenticated users - uses team API key
  useAuthenticatedInstance: (): Codecrawl => {
    const { selectedApiKey } = useApiKeyStore();

    if (selectedApiKey) {
      return createCodecrawlInstance(selectedApiKey);
    }

    // Fallback to default (should be prevented by UI for authenticated users)
    return defaultCodecrawl;
  },

  // Non-hook version for direct imports
  getAuthenticatedInstance: (teamApiKey?: string): Codecrawl => {
    if (teamApiKey) {
      return createCodecrawlInstance(teamApiKey);
    }

    return defaultCodecrawl;
  },

  // For marketing playground with request limits
  useMarketingInstance: (): {
    generateLLMsTxt: (
      url: string,
      options?: GenerateLLMsTextParams,
    ) => Promise<any>;
    generateFileTree: (url: string, options?: CrawlOptions) => Promise<any>;
    hasRemainingRequests: boolean;
    remainingRequests: number;
  } => {
    const {
      incrementRequestCount,
      hasRemainingRequests: checkRemainingRequests,
      getRemainingRequests,
    } = usePlaygroundRequestsStore();

    const hasRemainingRequests = checkRemainingRequests();
    const remainingRequests = getRemainingRequests();

    const generateLLMsTxt = async (
      url: string,
      options?: GenerateLLMsTextParams,
    ) => {
      if (!hasRemainingRequests) {
        toast.error(
          'You have reached the maximum number of requests. Please sign up for an account to continue.',
        );
        return { success: false, error: 'Request limit reached' };
      }

      try {
        const response = await defaultCodecrawl.generateLLMsTxt(url, options);
        incrementRequestCount();
        return response;
      } catch (error) {
        console.error('Error generating LLMs.txt:', error);
        return { success: false, error: 'Failed to generate LLMs.txt' };
      }
    };

    const generateFileTree = async (url: string, options?: CrawlOptions) => {
      if (!hasRemainingRequests) {
        toast.error(
          'You have reached the maximum number of requests. Please sign up for an account to continue.',
        );
        return { success: false, error: 'Request limit reached' };
      }

      try {
        const response = await defaultCodecrawl.generateFileTree(url, options);
        incrementRequestCount();
        return response;
      } catch (error) {
        console.error('Error generating file tree:', error);
        return { success: false, error: 'Failed to generate file tree' };
      }
    };

    return {
      generateLLMsTxt,
      generateFileTree,
      hasRemainingRequests,
      remainingRequests,
    };
  },
};
