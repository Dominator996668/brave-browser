import { program } from 'commander'
import { VersionManager } from '../core/versionManager'
import { RedisMonitor } from '../services/redisMonitor'
import logger from '../services/logger'
import { config } from '../config'

const redisMonitor = new RedisMonitor(config.redisUrl || 'redis://localhost:6379')
const versionManager = new VersionManager(redisMonitor.getClient())

program
  .name('version-checker')
  .description('Инструмент для проверки версий проектов')
  .version('1.0.0')

program
  .command('show')
  .description('Показать версии')
  .action(async () => {
    const chrome = await versionManager.getProjectRef('chrome')
    const braveCore = await versionManager.getProjectRef('brave-core')
    console.log(`Chrome: ${chrome || 'не найдено'}`)
    console.log(`Brave Core: ${braveCore || 'не найдено'}`)
  })

program
  .command('update <project> <version>')
  .description('Обновить версию проекта')
  .action((project, version) => {
    try {
      versionManager.updateBuildConfig({ [project]: version })
      console.log(`[INFO] Версия ${project} обновлена до ${version}`)
    } catch (err) {
      console.error(`[ERROR] ${err instanceof Error ? err.message : String(err)}`)
    }
  })

program.parse(process.argv)
