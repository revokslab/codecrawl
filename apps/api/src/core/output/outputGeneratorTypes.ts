import type { ConfigMerged } from '~/config/configSchema'
import type { ProcessedFile } from '../file/fileTypes'

export interface OutputGeneratorContext {
  generationDate: string
  treeString: string
  processedFiles: ProcessedFile[]
  config: ConfigMerged
}

export interface RenderContext {
  readonly processedFiles: ReadonlyArray<ProcessedFile>
  readonly markdownCodeBlockDelimiter: string
}
