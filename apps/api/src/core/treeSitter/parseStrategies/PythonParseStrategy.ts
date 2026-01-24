import type { Node } from 'web-tree-sitter'
import type { ParseContext, ParseStrategy } from './ParseStrategy'

enum CaptureType {
  Comment = 'comment',
  Class = 'definition.class',
  Function = 'definition.function',
  Docstring = 'docstring',
  TypeAlias = 'definition.type_alias',
}

type ParseResult = {
  content: string | null
  processedSignatures?: Set<string>
}

export class PythonParseStrategy implements ParseStrategy {
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

    const captureTypes = this.getCaptureType(name)

    // Class definition
    if (captureTypes.has(CaptureType.Class)) {
      return this.parseClassDefinition(lines, startRow, processedChunks).content
    }

    // Function definition
    if (captureTypes.has(CaptureType.Function)) {
      return this.parseFunctionDefinition(lines, startRow, processedChunks).content
    }

    // Docstring
    if (captureTypes.has(CaptureType.Docstring)) {
      return this.parseDocstringOrComment(lines, startRow, endRow, processedChunks).content
    }

    // Comment
    if (captureTypes.has(CaptureType.Comment)) {
      return this.parseDocstringOrComment(lines, startRow, endRow, processedChunks).content
    }

    // Type alias
    if (captureTypes.has(CaptureType.TypeAlias)) {
      return this.parseTypeAlias(lines, startRow, processedChunks).content
    }

    return null
  }

  private getCaptureType(name: string): Set<CaptureType> {
    const types = new Set<CaptureType>()
    for (const type of Object.values(CaptureType)) {
      if (name.includes(type)) {
        types.add(type)
      }
    }
    return types
  }

  private getDecorators(lines: string[], startRow: number): string[] {
    const decorators: string[] = []
    let currentRow = startRow - 1

    while (currentRow >= 0) {
      const line = lines[currentRow].trim()
      if (line.startsWith('@')) {
        decorators.unshift(line) // Add to beginning to maintain order
      } else {
        break
      }
      currentRow--
    }

    return decorators
  }

  private getClassInheritance(lines: string[], startRow: number): string | null {
    const line = lines[startRow]
    const match = line.match(/class\s+\w+\s*\((.*?)\):/)
    return match ? line.replace(/:\s*$/, '') : line.replace(/:\s*$/, '')
  }

  private getFunctionSignature(lines: string[], startRow: number): string | null {
    const line = lines[startRow]
    const match = line.match(/def\s+(\w+)\s*\((.*?)\)(\s*->\s*[^:]+)?:/)
    if (!match) return null
    return line.replace(/:\s*$/, '')
  }

  private parseClassDefinition(
    lines: string[],
    startRow: number,
    processedChunks: Set<string>
  ): ParseResult {
    const decorators = this.getDecorators(lines, startRow)
    const classDefinition = this.getClassInheritance(lines, startRow)
    const fullDefinition = [...decorators, classDefinition].join('\n')

    if (processedChunks.has(fullDefinition)) {
      return { content: null }
    }

    processedChunks.add(fullDefinition)
    return { content: fullDefinition }
  }

  private parseFunctionDefinition(
    lines: string[],
    startRow: number,
    processedChunks: Set<string>
  ): ParseResult {
    const decorators = this.getDecorators(lines, startRow)
    const signature = this.getFunctionSignature(lines, startRow)

    if (!signature) {
      return { content: null }
    }

    const fullDefinition = [...decorators, signature].join('\n')
    if (processedChunks.has(fullDefinition)) {
      return { content: null }
    }

    processedChunks.add(fullDefinition)
    return { content: fullDefinition }
  }

  private parseDocstringOrComment(
    lines: string[],
    startRow: number,
    endRow: number,
    processedChunks: Set<string>
  ): ParseResult {
    const content = lines.slice(startRow, endRow + 1).join('\n')

    if (processedChunks.has(content)) {
      return { content: null }
    }

    processedChunks.add(content)
    return { content }
  }

  private parseTypeAlias(
    lines: string[],
    startRow: number,
    processedChunks: Set<string>
  ): ParseResult {
    const typeAlias = lines[startRow].trim()

    if (processedChunks.has(typeAlias)) {
      return { content: null }
    }

    processedChunks.add(typeAlias)
    return { content: typeAlias }
  }
}
