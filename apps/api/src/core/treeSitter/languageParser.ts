import * as path from 'node:path'
import { Parser, Query } from 'web-tree-sitter'

import { ext2Lang } from './ext2Lang'
import { type SupportedLang, lang2Query } from './lang2Query'
import { loadLanguage } from './loadLanguage'
import { type ParseStrategy, createParseStrategy } from './parseStrategies'

interface LanguageResources {
  parser: Parser
  query: Query
  strategy: ParseStrategy
}

export class LanguageParser {
  private loadedResouces: Map<SupportedLang, LanguageResources> = new Map()
  private initialized = false

  private getFileExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase().slice(1)
  }

  private async prepareLang(name: SupportedLang): Promise<LanguageResources> {
    try {
      const lang = await loadLanguage(name)
      const parser = new Parser()
      parser.setLanguage(lang)
      const query = new Query(lang, lang2Query[name])
      const strategy = createParseStrategy(name)

      const resources: LanguageResources = {
        parser,
        query,
        strategy,
      }

      this.loadedResouces.set(name, resources)
      return resources
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to prepare language ${name}: ${message}`)
    }
  }

  private async getResources(name: SupportedLang): Promise<LanguageResources> {
    if (!this.initialized) {
      throw new Error('LanguageParser is not initialized. call init() first.')
    }

    const resources = this.loadedResouces.get(name)
    if (!resources) {
      return this.prepareLang(name)
    }
    return resources
  }

  public async getParserForLang(name: SupportedLang): Promise<Parser> {
    const resources = await this.getResources(name)
    return resources.parser
  }

  public async getQueryForLang(name: SupportedLang): Promise<Query> {
    const resources = await this.getResources(name)
    return resources.query
  }

  public async getStrategyForLang(name: SupportedLang): Promise<ParseStrategy> {
    const resources = await this.getResources(name)
    return resources.strategy
  }

  public guessTheLang(filePath: string): SupportedLang | undefined {
    const ext = this.getFileExtension(filePath)
    if (!Object.keys(ext2Lang).includes(ext)) {
      return undefined
    }
    return ext2Lang[ext as keyof typeof ext2Lang] as SupportedLang
  }

  public async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      await Parser.init()
      this.initialized = true
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to initialize LanguageParser: ${message}`)
    }
  }

  public async dispose(): Promise<void> {
    for (const resources of this.loadedResouces.values()) {
      resources.parser.delete()
    }
    this.loadedResouces.clear()
    this.initialized = false
  }
}
