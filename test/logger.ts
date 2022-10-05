import fs from 'fs'

import winston from 'winston'
const { combine, timestamp, printf, colorize, align } = winston.format

// const logLevel = process.env.LOG_LEVEL ?? 'info'

// const transports = {
//   console:
//   errorFile: new winston.transports.File({ level: 'error', filename: 'combined.log' })
// }
const logDir = 'logs'

if (!(fs.existsSync(logDir))) {
  fs.mkdirSync(logDir)
}

const logger = winston.createLogger({
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A'
    }),
    align(),
    printf((info) => `[${info.timestamp as string}] ${info.level}: ${info.message as string}`)
  ),
  transports: [
    new winston.transports.Console({ level: 'verbose' }),
    new winston.transports.File({
      // name: 'info-file',
      level: 'info',
      dirname: './logs',
      filename: './logs/info.log'
    }),
    new winston.transports.File({
      level: 'debug',
      dirname: './logs',
      filename: './logs/combined.log'
    })
  ]
})

// if (process.env.LOG_LEVEL == null) {
//   logger.silent = true
// }

export { logger }
