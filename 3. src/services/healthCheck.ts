import { RedisMonitor } from './redisMonitor'
import logger from './logger'

export class HealthCheck {
  private redisMonitor: RedisMonitor

  constructor(redisMonitor: RedisMonitor) {
    this.redisMonitor = redisMonitor
  }

  public async checkRedis(): Promise<boolean> {
    try {
      const client = this.redisMonitor.getClient()
      const response = await client.ping()
      return response === 'PONG'
    } catch (err) {
      logger.error(`Redis недоступен: ${err instanceof Error ? err.message : String(err)}`)
      return false
    }
  }

  public async checkAllServices(): Promise<{ status: string; services: Record<string, string> }> {
    const redisStatus = await this.checkRedis()

    return {
      status: redisStatus ? 'healthy' : 'unhealthy',
      services: {
        redis: redisStatus ? 'ok' : 'failed'
      }
    }
  }
}
