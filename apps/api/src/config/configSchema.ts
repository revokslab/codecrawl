import { z } from 'zod'
import type { TiktokenEncoding } from 'tiktoken'

// Output style enum
export const outputStyleSchema = z.enum(['xml', 'markdown', 'plain'])
export type OutputStyle = z.infer<typeof outputStyleSchema>

// Base config schema
export const configBaseSchema = z.object({
  output: z
    .object({
      filePath: z.string().optional(),
      style: outputStyleSchema.optional(),
      parsableStyle: z.boolean().optional(),
      headerText: z.string().optional(),
      instructionFilePath: z.string().optional(),
      fileSummary: z.boolean().optional(),
      directoryStructure: z.boolean().optional(),
      removeComments: z.boolean().optional(),
      removeEmptyLines: z.boolean().optional(),
      compress: z.boolean().optional(),
      topFilesLength: z.number().optional(),
      showLineNumbers: z.boolean().optional(),
      copyToClipboard: z.boolean().optional(),
      includeEmptyDirectories: z.boolean().optional(),
      git: z
        .object({
          sortByChanges: z.boolean().optional(),
          sortByChangesMaxCommits: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  include: z.array(z.string()).optional(),
  ignore: z
    .object({
      useGitignore: z.boolean().optional(),
      useDefaultPatterns: z.boolean().optional(),
      customPatterns: z.array(z.string()).optional(),
    })
    .optional(),
  security: z
    .object({
      enableSecurityCheck: z.boolean().optional(),
    })
    .optional(),
  tokenCount: z
    .object({
      encoding: z.string().optional(),
    })
    .optional(),
})

// Default config schema with default values
export const configDefaultSchema = z.object({
  output: z
    .object({
      style: outputStyleSchema.default('markdown'),
      parsableStyle: z.boolean().default(false),
      headerText: z.string().optional(),
      instructionFilePath: z.string().optional(),
      fileSummary: z.boolean().default(true),
      directoryStructure: z.boolean().default(true),
      removeComments: z.boolean().default(false),
      removeEmptyLines: z.boolean().default(false),
      compress: z.boolean().default(false),
      topFilesLength: z.number().int().min(0).default(5),
      showLineNumbers: z.boolean().default(false),
      copyToClipboard: z.boolean().default(false),
      includeEmptyDirectories: z.boolean().optional(),
      git: z
        .object({
          sortByChanges: z.boolean().default(true),
          sortByChangesMaxCommits: z.number().int().min(1).default(100),
        })
        .default({}),
    })
    .default({}),
  include: z.array(z.string()).default([]),
  ignore: z
    .object({
      useGitignore: z.boolean().default(true),
      useDefaultPatterns: z.boolean().default(true),
      customPatterns: z.array(z.string()).default([]),
    })
    .default({}),
  security: z
    .object({
      enableSecurityCheck: z.boolean().default(true),
    })
    .default({}),
  tokenCount: z
    .object({
      encoding: z
        .string()
        .default('o200k_base')
        .transform((val) => val as TiktokenEncoding),
    })
    .default({}),
})

export const configMergedSchema = configDefaultSchema.and(configBaseSchema).and(
  z.object({
    cwd: z.string().optional(),
  })
)

export type ConfigDefault = z.infer<typeof configDefaultSchema>
export type ConfigMerged = z.infer<typeof configMergedSchema>
export type ConfigBase = z.infer<typeof configBaseSchema>

export const defaultConfig = configDefaultSchema.parse({})
