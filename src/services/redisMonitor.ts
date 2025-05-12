import Redis from 'ioredis'
import logger from './logger'

export class RedisMonitor {
  private client: Redis.Redis
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl)
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.client.on('error', (err) => {
      logger.error(`Ошибка подключения к Redis: ${err.message}`)
      this.handleReconnect()
    })
  }

  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Превышено количество попыток подключения к Redis')
      return
    }

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 10000)
    this.reconnectAttempts++

    setTimeout(async () => {
      try {
        await this.client.ping()
        logger.info('Соединение с Redis восстановлено')
        this.reconnectAttempts = 0
      } catch (err) {
        logger.error(`Повторное подключение не удалось: ${err instanceof Error ? err.message : String(err)}`)
        this.handleReconnect()
      }
    }, delay)
  }

  public getClient(): Redis.Redis {
    return this.client
  }
      }
