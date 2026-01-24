import { isGitInstalled } from '../file/gitCommand'
import {
  configMergedSchema,
  type OutputStyle,
  type ConfigBase,
  type ConfigMerged,
} from '~/config/configSchema'
import { logger } from '~/lib/logger'
import type { CrawlOptions } from '~/types'
import { pack, type PackResult } from '../packager'
import { rethrowValidationErrorIfZodError } from '~/utils/errorHandle'
import {
  parseRemoteValue,
  createTempDirectory,
  cloneRepository,
  cleanupTempDirectory,
} from '../utils/remoteUtils'

export interface DefaultActionRunnerResult {
  packResult: PackResult
  config: ConfigMerged
}

/**
 * Clones a remote repository and runs the default packing process.
 * @param remoteUrl The remote repository URL or shorthand.
 * @param options Crawl options influencing the packing process.
 * @returns The packing result and the merged configuration.
 */
export const runDefaultAction = async (
  remoteUrl: string,
  options: CrawlOptions,
  deps = {
    isGitInstalled,
    parseRemoteValue,
    createTempDirectory,
    cloneRepository,
    cleanupTempDirectory,
    pack,
    buildConfig,
  }
): Promise<DefaultActionRunnerResult> => {
  logger.info('Running default action for remote URL:', remoteUrl)

  if (!(await deps.isGitInstalled())) {
    throw new Error('Git is not installed or not in the system PATH.')
  }

  const parsedFields = deps.parseRemoteValue(remoteUrl)
  const tempDirPath = await deps.createTempDirectory()
  let packResult: PackResult

  try {
    await deps.cloneRepository(
      parsedFields.repoUrl,
      tempDirPath,
      options.remoteBranch || parsedFields.remoteBranch
    )

    const config = deps.buildConfig(options)

    packResult = await deps.pack([tempDirPath], config, (message) => {
      logger.info(message)
    })
  } finally {
    await deps.cleanupTempDirectory(tempDirPath)
  }

  const finalConfig = buildConfig(options)

  return {
    packResult,
    config: finalConfig,
  }
}

/**
 * Builds Crawl configuration from options. Simplified as CWD is no longer relevant.
 *
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
  if (options.copy) {
    config.output = { ...config.output, copyToClipboard: options.copy }
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
  if (options.securityCheck === false) {
    config.security = { enableSecurityCheck: options.securityCheck }
  }
  if (options.fileSummary === false) {
    config.output = {
      ...config.output,
      fileSummary: false,
    }
  }
  if (options.directoryStructure === false) {
    config.output = {
      ...config.output,
      directoryStructure: false,
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
  if (options.headerText !== undefined) {
    config.output = { ...config.output, headerText: options.headerText }
  }

  if (options.compress !== undefined) {
    config.output = { ...config.output, compress: options.compress }
  }

  if (options.tokenCountEncoding) {
    config.tokenCount = { encoding: options.tokenCountEncoding }
  }
  if (options.instructionFilePath) {
    config.output = {
      ...config.output,
      instructionFilePath: options.instructionFilePath,
    }
  }
  if (options.includeEmptyDirectories) {
    config.output = {
      ...config.output,
      includeEmptyDirectories: options.includeEmptyDirectories,
    }
  }

  if (options.gitSortByChanges === false) {
    config.output = {
      ...config.output,
      git: {
        ...config.output?.git,
        sortByChanges: false,
      },
    }
  }

  try {
    return configMergedSchema.parse(config)
  } catch (error) {
    rethrowValidationErrorIfZodError(error, 'Invalid configuration options')
    throw error
  }
}
