import { createLogger, format, transports } from 'winston'
import { format as formatFn } from 'winston'
import path from 'path'
import fs from 'fs'

const logDir = path.resolve(__dirname, '../../logs')
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })

const { combine, timestamp, printf } = format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`
})

export default createLogger({
  level: 'debug',
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logDir, 'combined.log') })
  ]
})
