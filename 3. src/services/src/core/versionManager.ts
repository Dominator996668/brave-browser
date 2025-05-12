import { config } from '../config'
import { validateInput } from '../config/validator'
import { ProjectRefSchema } from '../types'
import { RedisMonitor } from '../services/redisMonitor'
import logger from '../services/logger'

export class VersionManager {
  private buildConfig: Record<string, string> = {}
  private redisClient: Redis.Redis

  constructor(redisClient: Redis.Redis) {
    this.redisClient = redisClient
    this.buildConfig = {
      chrome: config.chrome,
      'brave-core': config['brave-core']
    }
  }

  async getProjectRef(project: string): Promise<string | undefined> {
    try {
      const cached = await this.redisClient.get(project)
      if (cached) return cached

      const version = this.buildConfig[project] || 'not_set'
      if (version !== 'not_set') await this.redisClient.set(project, version, 'EX', 3600)
      return version
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      logger.error({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Ошибка Redis при получении "${project}"`,
        error: errorMessage,
        project
      })
      return this.buildConfig[project] || 'fallback_version'
    }
  }

  updateBuildConfig(newConfig: Record<string, string>): void {
    try {
      const validated = validateInput(ProjectRefSchema, newConfig)
      Object.assign(this.buildConfig, validated)
    } catch (err) {
      logger.error(`Ошибка валидации конфига: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
        }
