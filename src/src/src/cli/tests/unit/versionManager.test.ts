import { VersionManager } from '../../src/core/versionManager'
import { RedisMonitor } from '../../src/services/redisMonitor'
import logger from '../../src/services/logger'

jest.mock('../../src/services/logger')
jest.mock('ioredis')

describe('VersionManager', () => {
  let versionManager: VersionManager
  const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    ping: jest.fn()
  }

  beforeEach(() => {
    const redisMonitor = {
      getClient: () => mockRedisClient
    } as unknown as RedisMonitor
    versionManager = new VersionManager(redisMonitor.getClient())
  })

  test('Должен вернуть резервную версию при ошибке Redis', async () => {
    mockRedisClient.get.mockRejectedValue(new Error('Connection refused'))
    const version = await versionManager.getProjectRef('chrome')
    expect(version).toBeDefined()
  })

  test('Должен обновить версию Brave Core', () => {
    versionManager.updateBuildConfig({ 'brave-core': '3.0.0' })
    expect(versionManager['buildConfig']['brave-core']).toBe('3.0.0')
  })
})
