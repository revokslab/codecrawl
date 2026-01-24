import dotenv from 'dotenv'
import { describe, expect, test } from '@jest/globals'
import CodecrawlApp from '../index'

dotenv.config()

const TEST_API_KEY = process.env.TEST_API_KEY || 'test-api-key'
const API_URL = process.env.API_URL ?? 'https://api.irere.dev'

describe('CodecrawlApp', () => {
  test.concurrent('should throw error for no API key only for cloud service', async () => {
    if (API_URL.includes('api.irere.dev')) {
      expect(async () => {
        new CodecrawlApp({
          apiKey: null,
          apiUrl: API_URL,
        })
      }).toThrow('No API key provided')
    } else {
      expect(async () => {
        new CodecrawlApp({
          apiKey: null,
          apiUrl: API_URL,
        })
      }).not.toThrow()
    }
  })
})
