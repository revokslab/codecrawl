import { isGitInstalled } from '../file/gitCommand'
import {
  configMergedSchema,
  type ConfigBase,
  type ConfigMerged,
  type OutputStyle,
} from '~/config/configSchema'
import { logger } from '~/lib/logger'
import type { CrawlOptions } from '~/types'
import { rethrowValidationErrorIfZodError } from '~/utils/errorHandle'
import { generateOutput } from '../output/outputGenerate'
import { collectFiles } from '../file/fileCollect'
import { processFiles } from '../file/fileProcess'
import { searchFiles } from '../file/fileSearch'
import { sortPaths } from '../file/filePathSort'
import {
  parseRemoteValue,
  createTempDirectory,
  cloneRepository,
  cleanupTempDirectory,
} from '../utils/remoteUtils'

export interface LlmsTxtActionRunnerResult {
  llmsTxt: string
  config: ConfigMerged
}

/**
 * Clones a remote repository and generates the LLMSTxt output string.
 * @param remoteUrl The remote repository URL or shorthand.
 * @param options Crawl options influencing the output generation.
 * @returns The generated LLMSTxt string and the merged configuration.
 */
export const runLlmsTxtAction = async (
  remoteUrl: string,
  options: CrawlOptions,
  deps = {
    isGitInstalled,
    parseRemoteValue,
    createTempDirectory,
    cloneRepository,
    cleanupTempDirectory,
    searchFiles,
    sortPaths,
    collectFiles,
    processFiles,
    generateOutput,
    buildConfig,
  }
): Promise<LlmsTxtActionRunnerResult> => {
  logger.info('Running llmstxt action for remote URL:', remoteUrl)

  if (!(await deps.isGitInstalled())) {
    throw new Error('Git is not installed or not in the system PATH.')
  }

  const parsedFields = deps.parseRemoteValue(remoteUrl)
  const tempDirPath = await deps.createTempDirectory()
  let llmsTxt: string

  try {
    await deps.cloneRepository(
      parsedFields.repoUrl,
      tempDirPath,
      options.remoteBranch || parsedFields.remoteBranch
    )

    const config = deps.buildConfig(options)

    // --- Full pipeline: Search -> Sort -> Collect -> Process -> Generate ---
    logger.info('Searching files in cloned repo...')
    const searchResult = await deps.searchFiles(tempDirPath, config)
    const allFilePaths = searchResult.filePaths

    logger.info('Sorting files...')
    const sortedFilePaths = await deps.sortPaths(allFilePaths)

    logger.info('Collecting files...')
    const rawFiles = await deps.collectFiles(sortedFilePaths, tempDirPath, () => {})

    logger.info('Processing files...')
    const processedFiles = await deps.processFiles(rawFiles, config, () => {})

    logger.info('Generating output...')
    llmsTxt = await deps.generateOutput([tempDirPath], config, processedFiles, allFilePaths)
    // --- End of pipeline ---
  } finally {
    await deps.cleanupTempDirectory(tempDirPath)
  }

  const finalConfig = buildConfig(options)

  return {
    llmsTxt,
    config: finalConfig,
  }
}

/**
 * Builds configuration relevant to LLMSTxt generation.
 */
const buildConfig = (options: CrawlOptions): ConfigMerged => {
  const config: ConfigBase = {}

  if (options.output) {
    config.output = { filePath: options.output }
  }
  if (options.include) {
    config.include = options.include.split(',')
  }
  if (options.ignore) {
    config.ignore = { customPatterns: options.ignore.split(',') }
  }
  if (options.gitignore === false) {
    config.ignore = { ...config.ignore, useGitignore: options.gitignore }
  }
  if (options.defaultPatterns === false) {
    config.ignore = {
      ...config.ignore,
      useDefaultPatterns: options.defaultPatterns,
    }
  }
  if (options.topFilesLen !== undefined) {
    config.output = {
      ...config.output,
      topFilesLength: options.topFilesLen,
    }
  }
  if (options.outputShowLineNumbers !== undefined) {
    config.output = {
      ...config.output,
      showLineNumbers: options.outputShowLineNumbers,
    }
  }
  if (options.style) {
    config.output = {
      ...config.output,
      style: options.style.toLowerCase() as OutputStyle,
    }
  }
  if (options.parsableStyle !== undefined) {
    config.output = {
      ...config.output,
      parsableStyle: options.parsableStyle,
    }
  }
  if (options.removeComments !== undefined) {
    config.output = {
      ...config.output,
      removeComments: options.removeComments,
    }
  }
  if (options.removeEmptyLines !== undefined) {
    config.output = {
      ...config.output,
      removeEmptyLines: options.removeEmptyLines,
    }
  }
  if (options.includeEmptyDirectories) {
    config.output = {
      ...config.output,
      includeEmptyDirectories: options.includeEmptyDirectories,
    }
  }
  if (options.headerText !== undefined) {
    config.output = { ...config.output, headerText: options.headerText }
  }
  if (options.gitSortByChanges === false) {
    config.output = {
      ...config.output,
      git: { ...config.output?.git, sortByChanges: false },
    }
  }

  try {
    return configMergedSchema.parse(config)
  } catch (error) {
    rethrowValidationErrorIfZodError(error, 'Invalid configuration options for llmstxt')
    throw error
  }
}
