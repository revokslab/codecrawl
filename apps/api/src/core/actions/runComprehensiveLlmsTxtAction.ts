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
import { searchFiles, type FileSearchResult } from '../file/fileSearch'
import { sortPaths } from '../file/filePathSort'
import { generateTreeString } from '../file/fileTreeGenerate'
import type { ProcessedFile } from '../file/fileTypes'
import {
  parseRemoteValue,
  createTempDirectory,
  cloneRepository,
  cleanupTempDirectory,
} from '../utils/remoteUtils'

// Interface for file metrics (consistent with fileMetricsAction)
export interface FileMetrics {
  path: string
  lineCount: number
  characterCount: number
  fileSize: number
  // Content is omitted here as it's in the main output
}

export interface ComprehensiveLlmsTxtActionRunnerResult {
  comprehensiveText: string // The final combined output
  config: ConfigMerged
}

/**
 * Clones a remote repo, generates comprehensive LLMSTxt including
 * main content, file tree, and file summaries.
 * @param remoteUrl The remote repository URL or shorthand.
 * @param options Crawl options influencing output generation.
 * @returns The comprehensive LLMSTxt string and the merged configuration.
 */
export const runComprehensiveLlmsTxtAction = async (
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
    generateTreeString,
    buildConfig, // Keep internal
  }
): Promise<ComprehensiveLlmsTxtActionRunnerResult> => {
  logger.info('Running comprehensive llmstxt action for remote URL:', remoteUrl)

  if (!(await deps.isGitInstalled())) {
    throw new Error('Git is not installed or not in the system PATH.')
  }

  const parsedFields = deps.parseRemoteValue(remoteUrl)
  const tempDirPath = await deps.createTempDirectory()
  let comprehensiveText: string

  try {
    await deps.cloneRepository(
      parsedFields.repoUrl,
      tempDirPath,
      options.remoteBranch || parsedFields.remoteBranch
    )

    const config = deps.buildConfig(options)

    // --- Full pipeline: Search -> Sort -> Collect -> Process ---
    logger.info('Searching files...')
    const searchResult: FileSearchResult = await deps.searchFiles(tempDirPath, config)
    const allFilePaths = searchResult.filePaths

    logger.info('Sorting files...')
    const sortedFilePaths = await deps.sortPaths(allFilePaths)

    logger.info('Collecting files...')
    const rawFiles = await deps.collectFiles(sortedFilePaths, tempDirPath, () => {})

    logger.info('Processing files...')
    const processedFiles: ProcessedFile[] = await deps.processFiles(rawFiles, config, () => {})
    // --- End of pipeline ---

    logger.info('Generating main output...')
    // Force includeEmptyDirectories for tree generation consistency here
    const treeConfig = {
      ...config,
      output: { ...config.output, includeEmptyDirectories: true },
    }
    const mainOutput = await deps.generateOutput(
      [tempDirPath],
      treeConfig, // Use config that includes empty dirs for context passed to generateOutput
      processedFiles,
      allFilePaths
    )

    logger.info('Generating file tree...')
    const treeString = deps.generateTreeString(
      allFilePaths,
      searchResult.emptyDirPaths // Use actual empty dirs found
    )

    logger.info('Calculating file metrics...')
    const fileSummaries: FileMetrics[] = processedFiles.map((file) => ({
      path: file.path,
      lineCount: file.content.split('\n').length,
      characterCount: file.content.length,
      fileSize: Buffer.byteLength(file.content, 'utf8'),
    }))

    // --- Combine Outputs ---
    logger.info('Combining outputs...')
    let combinedOutput = mainOutput

    // Append Tree
    combinedOutput += '\n\n## Directory Structure\n\n```\n'
    combinedOutput += treeString
    combinedOutput += '\n```\n'

    // Append Summaries
    if (fileSummaries.length > 0) {
      combinedOutput += '\n## File Summaries\n'
      fileSummaries.forEach((summary) => {
        combinedOutput += `\n- ${summary.path}: ${summary.lineCount} lines, ${summary.characterCount} chars, ${summary.fileSize} bytes`
      })
      combinedOutput += '\n'
    }

    comprehensiveText = combinedOutput
  } finally {
    await deps.cleanupTempDirectory(tempDirPath)
  }

  const finalConfig = buildConfig(options) // Get config used for return value

  return {
    comprehensiveText,
    config: finalConfig,
  }
}

// --- buildConfig (Similar to llmsTxtAction, includes relevant options) ---
const buildConfig = (options: CrawlOptions): ConfigMerged => {
  const config: ConfigBase = {}
  // Copy relevant options from CrawlOptions to ConfigBase
  if (options.output) {
    config.output = { ...config.output, filePath: options.output }
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
  // Note: includeEmptyDirectories is forced true for internal tree generation,
  // but we respect the option if passed for other potential uses.
  if (options.includeEmptyDirectories !== undefined) {
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
    // Use parse to apply schema defaults
    return configMergedSchema.parse(config)
  } catch (error) {
    rethrowValidationErrorIfZodError(
      error,
      'Invalid configuration options for comprehensive llmstxt'
    )
    throw error
  }
}
