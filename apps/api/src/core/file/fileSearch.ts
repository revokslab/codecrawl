import * as fs from 'node:fs/promises'
import path from 'node:path'
import { minimatch } from 'minimatch'
import { globby } from 'globby'

import { logger } from '~/lib/logger'
import type { ConfigMerged } from '~/config/configSchema'
import { defaultIgnoreList } from '~/config/defaultIgnore'
import { sortPaths } from './filePathSort'

export interface FileSearchResult {
  filePaths: string[]
  emptyDirPaths: string[]
}

const findEmptyDirectories = async (
  rootDir: string,
  directories: string[],
  ignorePatterns: string[]
): Promise<string[]> => {
  const emptyDirs: string[] = []

  for (const dir of directories) {
    const fullPath = path.join(rootDir, dir)
    try {
      const entries = await fs.readdir(fullPath)
      const hasVisibileContents = entries.some((entry) => !entry.startsWith('.'))

      if (!hasVisibileContents) {
        // This checks if the directory itself matches any ignore patterns
        const shouldIgnore = ignorePatterns.some(
          (pattern) => minimatch(dir, pattern) || minimatch(`${dir}/`, pattern)
        )

        if (!shouldIgnore) {
          emptyDirs.push(dir)
        }
      }
    } catch (error) {
      logger.debug(`Error checking directory ${dir}:`, error)
    }
  }

  return emptyDirs
}

// Check if a path is a git worktree reference file
const isGitWorktreeRef = async (gitPath: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(gitPath)
    if (!stats.isFile()) {
      return false
    }

    const content = await fs.readFile(gitPath, 'utf8')
    return content.startsWith('gitdir:')
  } catch (error) {
    return false
  }
}

export const parseIgnoreContent = (content: string): string[] => {
  if (!content) return []

  return content.split('\n').reduce<string[]>((acc, line) => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      acc.push(trimmedLine)
    }
    return acc
  }, [])
}

/**
 * Escapes special characters in glob patterns to handle paths with parentheses.
 * Example: "src/(categories)" -> "src/\\(categories\\)"
 */
export const escapeGlobPattern = (pattern: string): string => {
  // First escape backslashes
  const escapedBackslashes = pattern.replace(/\\/g, '\\\\')
  // Then escape special characters
  return escapedBackslashes.replace(/[()[\]{}]/g, '\\$&')
}

// Get all file paths considering the config
export const searchFiles = async (
  rootDir: string,
  config: ConfigMerged
): Promise<FileSearchResult> => {
  const includePatterns =
    config.include.length > 0
      ? config.include.map((pattern) => escapeGlobPattern(pattern))
      : ['**/*']

  try {
    const [ignoreFilePatterns, ignorePatterns] = await Promise.all([
      getIgnoreFilePatterns(config),
      getIgnorePatterns(rootDir, config),
    ])

    logger.info('Include patterns:', includePatterns)
    logger.info('Ignore patterns:', ignorePatterns)
    logger.info('Ignore file patterns:', ignoreFilePatterns)

    // Check if .git is a worktree reference
    const gitPath = path.join(rootDir, '.git')
    const isWorktree = await isGitWorktreeRef(gitPath)

    // Modify ignore patterns for git worktree
    const adjustedIgnorePatterns = [...ignorePatterns]
    if (isWorktree) {
      // Remove '.git/**' pattern and add '.git' to ignore the reference file
      const gitIndex = adjustedIgnorePatterns.indexOf('.git/**')
      if (gitIndex !== -1) {
        adjustedIgnorePatterns.splice(gitIndex, 1)
        adjustedIgnorePatterns.push('.git')
      }
    }

    const filePaths = await globby(includePatterns, {
      cwd: rootDir,
      ignore: [...adjustedIgnorePatterns],
      ignoreFiles: [...ignoreFilePatterns],
      onlyFiles: true,
      absolute: false,
      dot: true,
      followSymbolicLinks: false,
    }).catch((error) => {
      // Handle EPERM errors specifically
      if (error.code === 'EPERM' || error.code === 'EACCES') {
        throw new Error(
          `Permission denied while scanning directory. Please check folder access permissions for your terminal app. path: ${rootDir}`
        )
      }
      throw error
    })

    let emptyDirPaths: string[] = []
    if (config.output.includeEmptyDirectories) {
      const directories = await globby(includePatterns, {
        cwd: rootDir,
        ignore: [...adjustedIgnorePatterns],
        ignoreFiles: [...ignoreFilePatterns],
        onlyDirectories: true,
        absolute: false,
        dot: true,
        followSymbolicLinks: false,
      })

      emptyDirPaths = await findEmptyDirectories(rootDir, directories, adjustedIgnorePatterns)
    }

    logger.info(`Filtered ${filePaths.length} files`)

    return {
      filePaths: sortPaths(filePaths),
      emptyDirPaths: sortPaths(emptyDirPaths),
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('Error filtering files:', error.message)
      throw new Error(`Failed to filter files in directory ${rootDir}. Reason: ${error.message}`)
    }

    logger.error('An unexpected error occurred:', error)
    throw new Error('An unexpected error occurred while filtering files.')
  }
}

export const getIgnoreFilePatterns = async (config: ConfigMerged): Promise<string[]> => {
  const ignoreFilePatterns: string[] = []

  if (config.ignore.useGitignore) {
    ignoreFilePatterns.push('**/.gitignore')
  }

  return ignoreFilePatterns
}

export const getIgnorePatterns = async (
  rootDir: string,
  config: ConfigMerged
): Promise<string[]> => {
  const ignorePatterns = new Set<string>()

  // Add default ignore patterns
  if (config.ignore.useDefaultPatterns) {
    logger.info('Adding default ignore patterns')
    for (const pattern of defaultIgnoreList) {
      ignorePatterns.add(pattern)
    }
  }

  // Add custom ignore patterns
  if (config.ignore.customPatterns) {
    logger.info('Adding custom ignore patterns:', config.ignore.customPatterns)
    for (const pattern of config.ignore.customPatterns) {
      ignorePatterns.add(pattern)
    }
  }

  // Add patterns from .git/info/exclude if useGitignore is enabled
  if (config.ignore.useGitignore) {
    const excludeFilePath = path.join(rootDir, '.git', 'info', 'exclude')

    try {
      const excludeFileContent = await fs.readFile(excludeFilePath, 'utf8')
      const excludePatterns = parseIgnoreContent(excludeFileContent)

      for (const pattern of excludePatterns) {
        ignorePatterns.add(pattern)
      }
    } catch (error) {
      // File might not exist or might not be accessible, which is fine
      logger.info(
        'Could not read .git/info/exclude file:',
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  return Array.from(ignorePatterns)
}
