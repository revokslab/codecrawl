import { isGitInstalled } from '../file/gitCommand'
import { runDefaultAction, type DefaultActionRunnerResult } from './defaultAction'
import {
  parseRemoteValue,
  createTempDirectory,
  cloneRepository,
  cleanupTempDirectory,
} from '../utils/remoteUtils'
import type { CrawlOptions } from '~/types'

export const runRemoteAction = async (
  repoUrlInput: string,
  options: CrawlOptions,
  deps = {
    isGitInstalled,
    parseRemoteValue,
    createTempDirectory,
    cloneRepository,
    cleanupTempDirectory,
    runDefaultAction,
  }
): Promise<DefaultActionRunnerResult> => {
  if (!(await deps.isGitInstalled())) {
    throw new Error('Git is not installed or not in the system PATH.')
  }

  const parsedFields = deps.parseRemoteValue(repoUrlInput)
  const tempDirPath = await deps.createTempDirectory()
  let result: DefaultActionRunnerResult

  try {
    await deps.cloneRepository(
      parsedFields.repoUrl,
      tempDirPath,
      options.remoteBranch || parsedFields.remoteBranch
    )

    result = await deps.runDefaultAction(repoUrlInput, options)
  } finally {
    await deps.cleanupTempDirectory(tempDirPath)
  }

  return result
}
