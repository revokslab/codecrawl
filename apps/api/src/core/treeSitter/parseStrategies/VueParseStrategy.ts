import type { Node } from 'web-tree-sitter'
import type { ParseContext, ParseStrategy } from './ParseStrategy'

export class VueParseStrategy implements ParseStrategy {
  parseCapture(
    capture: { node: Node; name: string },
    lines: string[],
    processedChunks: Set<string>,
    context: ParseContext
  ): string | null {
    const { node, name } = capture
    const startRow = node.startPosition.row
    const endRow = node.endPosition.row

    if (!lines[startRow]) {
      return null
    }

    // Extract the content based on the capture type
    const selectedLines = lines.slice(startRow, endRow + 1)
    if (selectedLines.length < 1) {
      return null
    }

    const chunk = selectedLines.join('\n')
    const normalizedChunk = chunk.trim()

    // Create a unique ID for this chunk
    const chunkId = `${name}:${startRow}`
    if (processedChunks.has(chunkId)) {
      return null
    }

    processedChunks.add(chunkId)
    return chunk
  }
}
