import winston from 'winston'
import 'winston-daily-rotate-file'
import config from '../../config'

const { combine, timestamp, json } = winston.format

const errorFilter = winston.format((info, opts) => {
    return info.level === 'error' ? info : false
})

const fileRotateTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/adviser-service-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
  })

const logger = winston.createLogger({
    level: config.log_level || 'info',
    format: winston.format.combine( timestamp(), json()),
    transports: [
        new winston.transports.Console(),
        fileRotateTransport,
        new winston.transports.File({ filename: 'adviser-service-error.log', level: 'error', format: combine(errorFilter(), timestamp(), json()) })
    ]
})

export default logger


