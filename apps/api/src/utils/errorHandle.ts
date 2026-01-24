import { z } from 'zod'

export class RepomixConfigValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CrawlConfigValidationError'
  }
}

export const rethrowValidationErrorIfZodError = (error: unknown, message: string): void => {
  if (error instanceof z.ZodError) {
    const zodErrorText = error.errors
      .map((err) => `[${err.path.join('.')}] ${err.message}`)
      .join('\n  ')
    throw new RepomixConfigValidationError(
      `${message}\n\n  ${zodErrorText}\n\n  Please check the config file and try again.`
    )
  }
}
