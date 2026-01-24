import type { ConfigMerged } from '~/config/configSchema'
import { logger } from '~/lib/logger'
import { parseFile } from '../../treeSitter/parseFile'
import { getFileManipulator } from '../fileManipulate'
import type { RawFile } from '../fileTypes'

export interface FileProcessTask {
  rawFile: RawFile
  config: ConfigMerged
}

export default async ({ config, rawFile }: FileProcessTask) => {
  const processedContent = await processContent(rawFile, config)

  return {
    path: rawFile.path,
    content: processedContent,
  }
}

export const processContent = async (rawFile: RawFile, config: ConfigMerged) => {
  const processStartAt = process.hrtime.bigint()
  let processedContent = rawFile.content
  const manipulator = getFileManipulator(rawFile.path)

  logger.info(`Processing file: ${rawFile.path}`)

  if (manipulator && config.output.removeComments) {
    processedContent = manipulator.removeComments(processedContent)
  }

  if (config.output.removeEmptyLines && manipulator) {
    processedContent = manipulator.removeEmptyLines(processedContent)
  }

  processedContent = processedContent.trim()

  if (config.output.compress) {
    try {
      const parsedContent = await parseFile(processedContent, rawFile.path)
      if (parsedContent === undefined) {
        logger.error(`Failed to parse file: ${rawFile.path}`)
      }
      processedContent = parsedContent ?? processedContent
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error(`Error parsing ${rawFile.path} in compressed mode: ${message}`)
      //re-throw error
      throw error
    }
  } else if (config.output.showLineNumbers) {
    const lines = processedContent.split('\n')
    const padding = lines.length.toString().length
    const numberedLines = lines.map((line, i) => `${(i + 1).toString().padStart(padding)}: ${line}`)
    processedContent = numberedLines.join('\n')
  }

  const processEndAt = process.hrtime.bigint()
  logger.info(
    `Processed file: ${rawFile.path}. Took: ${(Number(processEndAt - processStartAt) / 1e6).toFixed(2)}ms`
  )

  return processedContent
}
