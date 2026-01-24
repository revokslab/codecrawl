import type { ConfigMerged } from '~/config/configSchema'
import type { CrawlProgressCallback } from '~/types'
import { collectFiles } from '../file/fileCollect'
import { sortPaths } from '../file/filePathSort'
import { processFiles } from '../file/fileProcess'
import { searchFiles } from '../file/fileSearch'
import type { RawFile } from '../file/fileTypes'
import { calculateMetrics } from '../metrics/calculateMetrics'
import { generateOutput } from '../output/outputGenerate'

export interface PackResult {
  totalFiles: number
  totalCharacters: number
  totalTokens: number
  fileCharCounts: Record<string, number>
  fileTokenCounts: Record<string, number>
  output: string
}

export const pack = async (
  rootDirs: string[],
  config: ConfigMerged,
  progressCallback: CrawlProgressCallback = () => {},
  deps = {
    searchFiles,
    collectFiles,
    processFiles,
    generateOutput,
    calculateMetrics,
    sortPaths,
  }
): Promise<PackResult> => {
  progressCallback('Searching for files...')

  const filePathsByDir = await Promise.all(
    rootDirs.map(async (rootDir) => ({
      rootDir,
      filePaths: (await deps.searchFiles(rootDir, config)).filePaths,
    }))
  )

  // Sort file paths
  progressCallback('Sorting files...')
  const allFilePaths = filePathsByDir.flatMap(({ filePaths }) => filePaths)
  const sortedFilePaths = await deps.sortPaths(allFilePaths)

  // Regroup sorted file paths by rootDir
  const sortedFilePathsByDir = rootDirs.map((rootDir) => ({
    rootDir,
    filePaths: sortedFilePaths.filter((filePath) =>
      filePathsByDir.find((item) => item.rootDir === rootDir)?.filePaths.includes(filePath)
    ),
  }))

  progressCallback('Collecting files...')
  const rawFiles = (
    await Promise.all(
      sortedFilePathsByDir.map(({ rootDir, filePaths }) =>
        deps.collectFiles(filePaths, rootDir, progressCallback)
      )
    )
  ).reduce((acc: RawFile[], curr: RawFile[]) => acc.concat(...curr), [])

  // Process files (remove comments, etc.)
  progressCallback('Processing files...')
  const processedFiles = await deps.processFiles(rawFiles, config, progressCallback)

  progressCallback('Generating output...')
  const output = await deps.generateOutput(
    rootDirs,
    config,
    processedFiles,
    filePathsByDir.flatMap(({ filePaths }) => filePaths)
  )

  const metrics = await deps.calculateMetrics(processedFiles, output, progressCallback, config)

  return { ...metrics, output }
}
