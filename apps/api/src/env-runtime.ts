import { parseEnv } from './env'

export const env = parseEnv(Object.assign(process.env))
