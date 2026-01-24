import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CrawlOptions } from '@codecrawl/sdk'

type PlaygroundConfigurableOptions = Pick<
  CrawlOptions,
  | 'outputShowLineNumbers'
  | 'fileSummary'
  | 'directoryStructure'
  | 'removeComments'
  | 'removeEmptyLines'
  | 'includeEmptyDirectories'
  | 'gitSortByChanges'
  | 'include'
  | 'ignore'
  | 'gitignore'
  | 'defaultPatterns'
  | 'securityCheck'
  | 'output'
  | 'style'
  | 'parsableStyle'
  | 'compress'
>

interface PlaygroundSettingsState extends PlaygroundConfigurableOptions {
  githubUrl: string
}

interface PlaygroundSettingsActions {
  setGithubUrl: (url: string) => void
  setSettings: (settings: Partial<PlaygroundSettingsState>) => void
  resetSettings: () => void
  // Actions to get state values
  getSettings: () => PlaygroundSettingsState
  getGithubUrl: () => string
  getCrawlOptions: () => PlaygroundConfigurableOptions
}

type PlaygroundSettingsStore = PlaygroundSettingsState & PlaygroundSettingsActions

const initialPlaygroundSettingsState: PlaygroundSettingsState = {
  githubUrl: '',
  outputShowLineNumbers: false,
  fileSummary: false,
  directoryStructure: true,
  removeComments: true,
  removeEmptyLines: true,
  includeEmptyDirectories: false,
  gitSortByChanges: false,
  include: '',
  ignore: '',
  gitignore: true,
  defaultPatterns: true,
  securityCheck: false,
  // Default values for potentially undefined CrawlOptions properties
  output: 'markdown',
  style: 'markdown',
  parsableStyle: true,
  compress: false,
}

export const usePlaygroundSettingsStore = create<PlaygroundSettingsStore>()(
  persist(
    (set, get) => ({
      ...initialPlaygroundSettingsState,

      setGithubUrl: (url: string): void => set({ githubUrl: url }),

      setSettings: (settings: Partial<PlaygroundSettingsState>): void =>
        set((state) => ({ ...state, ...settings })),

      resetSettings: (): void => set(initialPlaygroundSettingsState),

      // Getter actions using the 'get' function provided by Zustand
      getSettings: (): PlaygroundSettingsState => get(),

      getGithubUrl: (): string => get().githubUrl,

      getCrawlOptions: (): PlaygroundConfigurableOptions => {
        const { githubUrl, ...crawlOptions } = get() // Destructure to exclude githubUrl
        // Clean up undefined optional properties before returning
        Object.keys(crawlOptions).forEach((key) => {
          if (crawlOptions[key as keyof PlaygroundConfigurableOptions] === undefined) {
            delete crawlOptions[key as keyof PlaygroundConfigurableOptions]
          }
        })
        return crawlOptions
      },
    }),
    {
      name: 'playground-settings-storage', // Name of the item in storage (must be unique)
    }
  )
)
