import winston from 'winston'

const logLevel = process.env.LOG_LEVEL ?? 'error'

const transports = {
  console: new winston.transports.Console({ level: logLevel })
}

const logger = winston.createLogger({
  transports: [
    transports.console
  ]
})

if (process.env.LOG_LEVEL == null) {
  logger.silent = true
}

export { logger }
