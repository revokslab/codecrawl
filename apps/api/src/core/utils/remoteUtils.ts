import * as fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import GitUrlParse, { type GitUrl } from 'git-url-parse'

import { execGitShallowClone } from '../file/gitCommand'
import { logger } from '~/lib/logger'

// Interface extending GitUrl to include commit hash
interface IGitUrl extends GitUrl {
  commit: string | undefined
}

// Check the short form of the GitHub URL. e.g. owner/repo
const VALID_NAME_PATTERN = '[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?'
const validShorthandRegex = new RegExp(`^${VALID_NAME_PATTERN}/${VALID_NAME_PATTERN}$`)

/**
 * Checks if a string is a valid GitHub shorthand (owner/repo).
 * @param remoteValue The string to check.
 * @returns True if it's a valid shorthand, false otherwise.
 */
export const isValidShorthand = (remoteValue: string): boolean => {
  return validShorthandRegex.test(remoteValue)
}

/**
 * Parses a remote repository value (URL or shorthand) into a usable URL and branch/ref.
 * @param remoteValue The remote repository URL or shorthand (e.g., "owner/repo", "https://github.com/owner/repo.git#main").
 * @returns An object containing the normalized git URL and the target branch/ref.
 * @throws Error if the input value is invalid.
 */
export const parseRemoteValue = (
  remoteValue: string
): { repoUrl: string; remoteBranch: string | undefined } => {
  if (isValidShorthand(remoteValue)) {
    logger.info(`Formatting GitHub shorthand: ${remoteValue}`)
    return {
      repoUrl: `https://github.com/${remoteValue}.git`,
      remoteBranch: undefined, // Default branch will be cloned
    }
  }

  try {
    const parsedFields = GitUrlParse(remoteValue) as IGitUrl

    // Ensure .git suffix for cloning
    parsedFields.git_suffix = true

    // Basic validation of the owner/repo part if present
    const ownerSlashRepo =
      parsedFields.full_name.split('/').length > 1
        ? parsedFields.full_name.split('/').slice(-2).join('/')
        : ''

    if (ownerSlashRepo !== '' && !isValidShorthand(ownerSlashRepo)) {
      throw new Error('Invalid owner/repo structure in repo URL')
    }

    const repoUrl = parsedFields.toString(parsedFields.protocol)
    let remoteBranch: string | undefined = undefined

    if (parsedFields.ref) {
      // Handle cases like #main or #refs/heads/develop/feature
      remoteBranch = parsedFields.filepath
        ? `${parsedFields.ref}/${parsedFields.filepath}` // If there's a path after #, include it
        : parsedFields.ref
    } else if (parsedFields.commit) {
      // Handle commit hash if present (though less common in GitUrlParse)
      remoteBranch = parsedFields.commit
    }

    return {
      repoUrl: repoUrl,
      remoteBranch: remoteBranch,
    }
  } catch (error) {
    logger.error('Failed to parse remote value', { remoteValue, error })
    throw new Error(
      `Invalid remote repository URL or shorthand: ${remoteValue}. ${error instanceof Error ? error.message : 'Parsing failed.'}`
    )
  }
}

/**
 * Checks if a remote value (URL or shorthand) is valid by attempting to parse it.
 * @param remoteValue The string to check.
 * @returns True if parsing succeeds, false otherwise.
 */
export const isValidRemoteValue = (remoteValue: string): boolean => {
  try {
    parseRemoteValue(remoteValue)
    return true
  } catch (error) {
    // Intentionally catch and return false for validation check
    return false
  }
}

/**
 * Creates a temporary directory for cloning the repository.
 * @returns The path to the created temporary directory.
 * @throws Error if directory creation fails.
 */
export const createTempDirectory = async (): Promise<string> => {
  try {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codecrawl-repo-'))
    logger.info(`Created temporary directory: ${tempDir}`)
    return tempDir
  } catch (error) {
    logger.error('Failed to create temporary directory', { error })
    throw new Error(
      `Failed to create temporary directory: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Clones a Git repository into a specified directory.
 * @param url The Git repository URL.
 * @param directory The target directory path for cloning.
 * @param remoteBranch Optional specific branch, tag, or commit hash to check out.
 * @param deps Dependencies, primarily execGitShallowClone.
 * @throws Error if cloning fails.
 */
export const cloneRepository = async (
  url: string,
  directory: string,
  remoteBranch?: string,
  deps = { execGitShallowClone }
): Promise<void> => {
  logger.info('Attempting to clone repository', {
    url,
    directory,
    branch: remoteBranch ?? 'default',
  })

  try {
    // Use shallow clone for efficiency
    await deps.execGitShallowClone(url, directory, remoteBranch)
    logger.info('Successfully cloned repository', { url, directory })
  } catch (error) {
    logger.error('Failed to clone repository', { url, directory, error })
    // Attempt cleanup even if clone fails
    await cleanupTempDirectory(directory).catch((cleanupError) => {
      logger.error('Failed to cleanup directory after clone failure', {
        directory,
        cleanupError,
      })
    })
    throw new Error(
      `Failed to clone repository ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Removes a directory recursively.
 * @param directory The path to the directory to remove.
 * @throws Does not throw if removal fails, logs an error instead.
 */
export const cleanupTempDirectory = async (directory: string): Promise<void> => {
  logger.info(`Attempting to cleanup temporary directory: ${directory}`)
  try {
    await fs.rm(directory, { recursive: true, force: true })
    logger.info(`Successfully cleaned up temporary directory: ${directory}`)
  } catch (error) {
    logger.error('Failed to cleanup temporary directory', { directory, error })
    // Do not re-throw, cleanup failure shouldn't stop the overall process if possible
  }
}
