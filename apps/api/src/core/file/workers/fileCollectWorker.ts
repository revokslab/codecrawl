import * as fs from 'node:fs/promises'
import path from 'node:path'
import iconv from 'iconv-lite'
import jschartdet from 'jschardet'
import { isBinary } from 'istextorbinary'

import { logger } from '~/lib/logger'

// Maximum file size to process (50MB)
// This provents out-of-memory errors when processing very large files
export const MAX_FILE_SIZE = 50 * 1024 * 1024

export interface FileCollectTask {
  filePath: string
  rootDir: string
}

export default async ({ filePath, rootDir }: FileCollectTask) => {
  const fullPath = path.resolve(rootDir, filePath)
  const content = await readRawFile(fullPath)

  if (content) {
    return {
      path: filePath,
      content,
    }
  }

  return null
}

const readRawFile = async (filePath: string): Promise<string | null> => {
  try {
    const stats = await fs.stat(filePath)
    if (stats.size > MAX_FILE_SIZE) {
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1)
      logger.warn('')
      logger.warn('⚠️ Large File Warning:')
      logger.warn('------------------')
      logger.warn(
        `File exceeds size limit: ${sizeMB}MB > ${MAX_FILE_SIZE / 1024 / 1024}MB (${filePath})`
      )
      return null
    }

    if (isBinary(filePath)) {
      logger.debug(`Skipping binary file: ${filePath}`)
      return null
    }

    logger.info(`Reading file: ${filePath}`)

    const buffer = await fs.readFile(filePath)

    if (isBinary(null, buffer)) {
      logger.debug(`Skipping binary file (content check): ${filePath}`)
      return null
    }

    const encoding = jschartdet.detect(buffer).encoding || 'utf-8'
    const content = iconv.decode(buffer, encoding)
    return content
  } catch (error) {
    logger.warn(`Failed to read file: ${filePath}`, error)
    return null
  }
}
