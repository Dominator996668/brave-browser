import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { config } from '../config'
import { VersionManager } from '../core/versionManager'
import { RedisMonitor } from '../services/redisMonitor'
import { HealthCheck } from '../services/healthCheck'
import logger from '../services/logger'

const app = express()
const redisMonitor = new RedisMonitor(config.redisUrl || 'redis://localhost:6379')
const versionManager = new VersionManager(redisMonitor.getClient())
const healthCheck = new HealthCheck(redisMonitor)

app.use(helmet())
app.use(cors())

app.get('/api/versions', async (req, res) => {
  try {
    const versions = {
      chrome: await versionManager.getProjectRef('chrome'),
      'brave-core': await versionManager.getProjectRef('brave-core'),
      timestamp: new Date().toISOString()
    }
    res.json(versions)
  } catch (err) {
    logger.error(`Ошибка получения версий: ${err instanceof Error ? err.message : String(err)}`)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/api/health', async (req, res) => {
  const status = await healthCheck.checkAllServices()
  res.status(status.status === 'healthy' ? 200 : 503).json(status)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  logger.info(`[SERVER] Запущен на порту ${PORT}`)
})
