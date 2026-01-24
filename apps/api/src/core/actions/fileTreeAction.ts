import { isGitInstalled } from '../file/gitCommand'
import { configMergedSchema, type ConfigBase, type ConfigMerged } from '~/config/configSchema'
import { logger } from '~/lib/logger'
import type { CrawlOptions } from '~/types'
import { rethrowValidationErrorIfZodError } from '~/utils/errorHandle'
import { generateTreeString } from '../file/fileTreeGenerate'
import { type FileSearchResult, searchFiles } from '../file/fileSearch'
import {
  parseRemoteValue,
  createTempDirectory,
  cloneRepository,
  cleanupTempDirectory,
} from '../utils/remoteUtils'

export interface FileTreeActionRunnerResult {
  treeString: string
  config: ConfigMerged
}

/**
 * Clones a remote repository and generates its file tree structure.
 * @param remoteUrl The remote repository URL or shorthand.
 * @param options Crawl options influencing file search (e.g., ignore patterns).
 * @returns The generated tree string and the merged configuration.
 */
export const runFileTreeAction = async (
  remoteUrl: string,
  options: CrawlOptions,
  deps = {
    isGitInstalled,
    parseRemoteValue,
    createTempDirectory,
    cloneRepository,
    cleanupTempDirectory,
    searchFiles,
    generateTreeString,
    buildConfig,
  }
): Promise<FileTreeActionRunnerResult> => {
  logger.info('Running file tree action for remote URL:', remoteUrl)

  if (!(await deps.isGitInstalled())) {
    throw new Error('Git is not installed or not in the system PATH.')
  }

  const parsedFields = deps.parseRemoteValue(remoteUrl)
  const tempDirPath = await deps.createTempDirectory()
  let treeString: string
  let fileSearchResult: FileSearchResult = { filePaths: [], emptyDirPaths: [] }

  try {
    await deps.cloneRepository(
      parsedFields.repoUrl,
      tempDirPath,
      options.remoteBranch || parsedFields.remoteBranch
    )

    const config = deps.buildConfig(options)

    // Search files in the cloned directory
    // Note: searchFiles takes a single rootDir
    fileSearchResult = await deps.searchFiles(tempDirPath, config)

    // Generate tree string from search results
    treeString = deps.generateTreeString(
      fileSearchResult.filePaths,
      config.output.includeEmptyDirectories ? fileSearchResult.emptyDirPaths : []
    )
  } finally {
    await deps.cleanupTempDirectory(tempDirPath)
  }

  const finalConfig = buildConfig(options)

  return {
    treeString,
    config: finalConfig,
  }
}

/**
 * Builds configuration relevant to file tree generation.
 */
const buildConfig = (options: CrawlOptions): ConfigMerged => {
  const config: ConfigBase = {}

  // Only include options relevant to searchFiles and generateTreeString
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
  // generateTreeString uses this config option
  if (options.includeEmptyDirectories) {
    config.output = {
      ...config.output,
      includeEmptyDirectories: options.includeEmptyDirectories,
    }
  }

  try {
    // Use parse to apply defaults from the schema
    return configMergedSchema.parse(config)
  } catch (error) {
    rethrowValidationErrorIfZodError(error, 'Invalid configuration options for file tree')
    throw error
  }
}
