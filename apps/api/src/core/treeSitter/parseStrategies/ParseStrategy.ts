import type { Query, Tree, Node } from 'web-tree-sitter'

import type { SupportedLang } from '../lang2Query'
import { TypeScriptParseStrategy } from './TypescriptStrategy'
import { GoParseStrategy } from './GoParseStrategy'
import { DefaultParseStrategy } from './DefaultParseStrategy'
import { PythonParseStrategy } from './PythonParseStrategy'
import { CssParseStrategy } from './CssParseStrategy'
import { VueParseStrategy } from './VueParseStrategy'

export interface ParseContext {
  fileContent: string
  lines: string[]
  tree: Tree | null
  query: Query
}

export interface ParseStrategy {
  parseCapture(
    capture: { node: Node; name: string },
    lines: string[],
    processedChunks: Set<string>,
    context: ParseContext
  ): string | null
}

export function createParseStrategy(lang: SupportedLang): ParseStrategy {
  switch (lang) {
    case 'typescript':
      return new TypeScriptParseStrategy()
    case 'go':
      return new GoParseStrategy()
    case 'python':
      return new PythonParseStrategy()
    case 'css':
      return new CssParseStrategy()
    case 'vue':
      return new VueParseStrategy()
    default:
      return new DefaultParseStrategy()
  }
}
