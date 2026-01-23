import type { HttpBindings } from '@hono/node-server';
import type { OutputStyle } from './config/configSchema';

export type CrawlProgressCallback = (message: string) => void;

export type PlanType = 'standard' | 'scale' | 'hobby' | 'growth' | 'free';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export type HonoVariables = {};

type Bindings = HttpBindings & {
  /* ... */
};

export type AppBindings = { Variables: HonoVariables; Bindings: Bindings };

export interface CrawlOptions {
  // Codecrawl Cloud Options
  teamId?: string;
  plan?: string;

  // Output Options
  output?: string;
  style?: OutputStyle;
  parsableStyle?: boolean;
  compress?: boolean;
  outputShowLineNumbers?: boolean;
  copy?: boolean;
  fileSummary?: boolean;
  directoryStructure?: boolean;
  removeComments?: boolean;
  removeEmptyLines?: boolean;
  headerText?: string;
  instructionFilePath?: string;
  includeEmptyDirectories?: boolean;
  gitSortByChanges?: boolean;

  // Filter Options
  include?: string;
  ignore?: string;
  gitignore?: boolean;
  defaultPatterns?: boolean;

  // Remote Repository Options
  remote?: string;
  remoteBranch?: string;

  // Configuration Options
  config?: string;
  init?: boolean;
  global?: boolean;

  // Security Options
  securityCheck?: boolean;

  // Token Count Options
  tokenCountEncoding?: string;

  // Other Options
  topFilesLen?: number;
  verbose?: boolean;
  quiet?: boolean;
}

export enum RateLimiterMode {
  Crawl = 'crawl',
  CrawlStatus = 'crawlStatus',
  Search = 'search',
}
