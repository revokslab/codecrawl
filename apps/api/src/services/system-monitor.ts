import si from 'systeminformation'
import { Mutex } from 'async-mutex'
import * as fs from 'node:fs'
import os from 'node:os'

import { logger } from '~/lib/logger'

const IS_KUBERNETES = process.env.IS_KUBERNETES === 'true'

const MAX_CPU = process.env.MAX_CPU ? Number.parseFloat(process.env.MAX_CPU) : 0.8
const MAX_RAM = process.env.MAX_RAM ? Number.parseFloat(process.env.MAX_RAM) : 0.8
const CACHE_DURATION = process.env.SYS_INFO_MAX_CACHE_DURATION
  ? Number.parseFloat(process.env.SYS_INFO_MAX_CACHE_DURATION)
  : 150

class SystemMonitor {
  private static instance: SystemMonitor
  private static instanceMutex = new Mutex()

  private cpuUsageCache: number | null = null
  private memoryUsageCache: number | null = null
  private lastCpuCheck = 0
  private lastMemoryCheck = 0

  // Variables for CPU usage calculation
  private previousCpuUsage = 0
  private previousTime: number = Date.now()

  private constructor() {}

  public static async getInstance(): Promise<SystemMonitor> {
    if (SystemMonitor.instance) {
      return SystemMonitor.instance
    }

    await SystemMonitor.instanceMutex.runExclusive(() => {
      if (!SystemMonitor.instance) {
        SystemMonitor.instance = new SystemMonitor()
      }
    })

    return SystemMonitor.instance
  }

  public async checkMemoryUsage() {
    if (IS_KUBERNETES) {
      return this._checkMemoryUsageKubernetes()
    }
    return this._checkMemoryUsage()
  }

  private readMemoryCurrent(): number {
    const data = fs.readFileSync('/sys/fs/cgroup/memory.current', 'utf8').trim()
    return Number.parseInt(data, 10)
  }

  private readMemoryMax(): number {
    const data = fs.readFileSync('/sys/fs/cgroup/memory.max', 'utf8').trim()
    if (data === 'max') {
      return Number.POSITIVE_INFINITY
    }
    return Number.parseInt(data, 10)
  }

  private async _checkMemoryUsageKubernetes() {
    try {
      const currentMemoryUsage = this.readMemoryCurrent()
      const memoryLimit = this.readMemoryMax()

      let memoryUsagePercentage = 0

      if (memoryLimit === Number.POSITIVE_INFINITY) {
        // No memory limit set; use total system memory
        const totalMemory = os.totalmem()
        memoryUsagePercentage = currentMemoryUsage / totalMemory
      } else {
        memoryUsagePercentage = currentMemoryUsage / memoryLimit
      }

      return memoryUsagePercentage
    } catch (error) {
      logger.error(`Error calculating memory usage: ${error}`)
      return 0 // Fallback to 0% usage
    }
  }

  private async _checkMemoryUsage() {
    const now = Date.now()

    if (this.memoryUsageCache !== null && now - this.lastMemoryCheck < CACHE_DURATION) {
      return this.memoryUsageCache
    }

    const memoryData = await si.mem()
    const totalMemory = memoryData.total
    const availableMemory = memoryData.available
    const usedMemory = totalMemory - availableMemory
    const memoryUsagePercentage = usedMemory / totalMemory

    this.memoryUsageCache = memoryUsagePercentage
    this.lastMemoryCheck = now

    return memoryUsagePercentage
  }

  public async checkCpuUsage() {
    if (IS_KUBERNETES) {
      return this._checkCpuUsageKubernetes()
    }
    return this._checkCpuUsage()
  }

  private readCpuUsage(): number {
    const data = fs.readFileSync('/sys/fs/cgroup/cpu.stat', 'utf8').trim()
    const match = data.match(/^usage_usec (\d+)$/m)
    if (match) {
      return Number.parseInt(match[1], 10)
    }
    throw new Error('Failed to read usage_usec from cpu.stat')
  }

  private getNumberOfCPUs(): number {
    let cpus: number[] = []
    try {
      const cpusetpath = '/sys/fs/cgroup/cpuset.cpus.effective'
      const data = fs.readFileSync(cpusetpath, 'utf8').trim()

      if (!data) {
        throw new Error(`${cpusetpath} is empty`)
      }

      cpus = this.parseCpuList(data)

      if (cpus.length === 0) {
        throw new Error(`No CPUs found in ${cpusetpath}`)
      }
    } catch (error) {
      logger.warn(`Unable to read cpuset.cpus.effective, defaulting to OS CPUs: ${error}`)
      cpus = os.cpus().map((_cpu, index) => index)
    }
    return cpus.length
  }

  private parseCpuList(cpuList: string): number[] {
    const ranges = cpuList.split(',')
    const cpus: number[] = []
    ranges.forEach((range) => {
      const [startStr, endStr] = range.split('-')
      const start = Number.parseInt(startStr, 10)
      const end = endStr !== undefined ? Number.parseInt(endStr, 10) : start
      for (let i = start; i <= end; i++) {
        cpus.push(i)
      }
    })
    return cpus
  }

  private async _checkCpuUsageKubernetes() {
    try {
      const usage = this.readCpuUsage()
      const now = Date.now()

      // Check if it's the first run
      if (this.previousCpuUsage === 0) {
        // Initialize previous values
        this.previousCpuUsage = usage
        this.previousTime = now
        return 0 // No CPU usage available yet
      }

      const deltaUsage = usage - this.previousCpuUsage
      const deltaTime = (now - this.previousTime) * 1000 // Convert to microseconds

      const numCpus = this.getNumberOfCPUs()

      // Calculate the CPU usage percentage and normalize by the number of CPUs
      const cpuUsagePercentage = deltaUsage / deltaTime / numCpus

      // Update previous values
      this.previousCpuUsage = usage
      this.previousTime = now

      return cpuUsagePercentage
    } catch (error) {
      logger.error(`Error calculating CPU usage: ${error}`)
      return 0 // Fallback to 0% usage
    }
  }

  private async _checkCpuUsage() {
    const now = Date.now()
    if (this.cpuUsageCache !== null && now - this.lastCpuCheck < CACHE_DURATION) {
      return this.cpuUsageCache
    }

    const cpuData = await si.currentLoad()
    const cpuLoad = cpuData.currentLoad / 100

    this.cpuUsageCache = cpuLoad
    this.lastCpuCheck = now

    return cpuLoad
  }

  public async acceptConnection() {
    const cpuUsage = await this.checkCpuUsage()
    const memoryUsage = await this.checkMemoryUsage()

    return cpuUsage < MAX_CPU && memoryUsage < MAX_RAM
  }

  public clearCache() {
    this.cpuUsageCache = null
    this.memoryUsageCache = null
    this.lastCpuCheck = 0
    this.lastMemoryCheck = 0
  }
}

export default SystemMonitor.getInstance()
