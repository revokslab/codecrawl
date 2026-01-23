import { runRemoteAction } from '~/core/actions/remoteAction';
import {
  createLlmsTxt,
  getLlmsTxtByRepoUrl,
  getOrderedLlmsTxtByRepoUrl,
  updateLlmsTxtByRepoUrl,
} from '~/db/queries';
import { logger as _logger } from '~/lib/logger';
import { updateGeneratedLlmsTxt } from './redis';

interface LlmsTextCache {
  repoUrl: string;
  llmstxt: string;
  llmstxt_full: string;
  maxUrls: number;
}

export async function getLlmsTextFromCache(
  url: string,
  maxUrls: number,
): Promise<LlmsTextCache | null> {
  try {
    const [data] = await getOrderedLlmsTxtByRepoUrl(url, maxUrls);

    // Check if data is older than 1 week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    if (!data || new Date(data.updatedAt as Date) < oneWeekAgo) {
      return null;
    }

    return data;
  } catch (error) {
    _logger.error('Failed to fetch LLMs text from cache', { error, url });
    return null;
  }
}

export async function saveLlmsTxtToCache(
  url: string,
  llmstxt: string,
  llmstxtFull: string,
  maxUrls: number,
): Promise<void> {
  try {
    const [existingData] = await getLlmsTxtByRepoUrl(url);

    if (existingData) {
      // Update existing entry
      try {
        await updateLlmsTxtByRepoUrl({
          repoUrl: url,
          llmstxt,
          llmstxtFull,
          maxUrls,
        });
        _logger.debug('Successfully updated cached LLMs text', {
          url,
          maxUrls,
        });
      } catch (error) {
        _logger.error('Error updating LLMs text in cache', { error, url });
      }
    } else {
      // Insert new entry
      try {
        await createLlmsTxt({
          repoUrl: url,
          llmstxt,
          llmstxtFull,
          maxUrls,
        });
        _logger.debug('Successfully inserted new cached LLMs text', {
          url,
          maxUrls,
        });
      } catch (error) {
        _logger.error('Error inserting LLMs text to cache', { error, url });
      }
    }
  } catch (error) {
    _logger.error('Failed to save LLMs text to cache', { error, url });
  }
}

/**
 * Services
 */

interface GenerateLLMsTextServiceOptions {
  generationId: string;
  url: string;
  maxUrls: number;
  showFullText: boolean;
  subId?: string;
}

export async function performGenerateLlmsTxt(
  options: GenerateLLMsTextServiceOptions,
) {
  const { generationId, maxUrls, showFullText, url } = options;

  const startTime = Date.now();
  const logger = _logger.child({
    module: 'generate-llmstxt',
    method: 'performGenerateLlmsTxt',
    generationId,
  });

  try {
    // Enforce max URL limit (assuming this applies to files/pages within the repo)
    // The actual enforcement might happen within runRemoteAction based on config
    const effectiveMaxUrls = Math.min(maxUrls ?? 5000, 5000); // Use default 5000 if maxUrls is undefined

    // Check cache first
    logger.info('Checking cache for LLMs text', { url, effectiveMaxUrls });
    const cachedResult = await getLlmsTextFromCache(url, effectiveMaxUrls);

    if (cachedResult) {
      logger.info('Found cached LLMs text', { url });

      // Use cached data
      const generatedText = cachedResult.llmstxt;
      const fullText = cachedResult.llmstxt_full;

      // Update final result with cached text
      await updateGeneratedLlmsTxt(generationId, {
        status: 'completed',
        generatedText: generatedText,
        fullText: fullText,
        showFullText: showFullText, // Store the requested showFullText flag
      });

      logger.info('Successfully updated job with cached data', {
        generationId,
        duration: Date.now() - startTime,
      });
      return {
        success: true,
        data: {
          generatedText: generatedText,
          fullText: fullText,
          showFullText: showFullText, // Return based on the request
        },
      };
    }

    logger.info('No cache hit, proceeding with remote action', { url });
    // Assuming runRemoteAction takes options that might include limits derived from effectiveMaxUrls
    // Pass effectiveMaxUrls as topFilesLen to potentially limit the number of files in the output,
    // ensuring comprehensiveness up to the specified limit.
    const results = await runRemoteAction(url, {
      remote: url,
      topFilesLen: effectiveMaxUrls, // Map maxUrls to topFilesLen
      // Add other relevant options if needed based on CrawlOptions
      // For max comprehensiveness, ensure things like removeComments are not true by default
    });

    // Check for valid results
    if (!results?.packResult?.output) {
      logger.error('Remote action failed to return valid packResult.output', {
        url,
        results,
      });
      // Throw an error to be caught by the main catch block
      throw new Error(
        `Failed to generate content: Remote action did not return expected output for URL: ${url}`,
      );
    }

    // Assuming packResult.output is the complete, intended text.
    // If limiting/separating logic is needed, it should ideally be in the pack/output generation.
    const generatedOutput = results.packResult.output;
    const llmstxt = generatedOutput; // Assign the full output as the primary text
    const llmsFulltxt = generatedOutput; // Assign the full output as the 'full' text

    logger.info('Remote action successful, saving to cache', { url });
    // After successful generation, save to cache
    await saveLlmsTxtToCache(url, llmstxt, llmsFulltxt, effectiveMaxUrls);

    logger.info('Updating final job status', { generationId });
    // Update final result with generated text
    await updateGeneratedLlmsTxt(generationId, {
      status: 'completed',
      generatedText: llmstxt,
      fullText: llmsFulltxt, // Save the full text
      showFullText: showFullText, // Store the requested flag
    });

    logger.info('Successfully completed LLMs text generation', {
      generationId,
      duration: Date.now() - startTime,
    });
    return {
      success: true,
      data: {
        generatedText: llmstxt,
        fullText: llmsFulltxt,
        showFullText: showFullText, // Return based on the request
      },
    };
  } catch (error) {
    logger.error('Generate LLMs text error', { error, generationId });

    // Update status to failed
    await updateGeneratedLlmsTxt(generationId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Rethrow the error to be handled by the caller or job runner
    throw error;
  }
}
