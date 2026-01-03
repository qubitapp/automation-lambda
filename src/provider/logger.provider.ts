import winston, { Logger, createLogger, format } from 'winston'
const { combine, timestamp, printf } = format

export class LoggerProvider {
  private static instance: LoggerProvider
  private log: Logger

  public logger!: {
    error: Function
    debug: Function
    info: Function
    warn: Function
    success: Function
  }

  private constructor() {
    const myFormat = printf(({ level, message }: any) => {
      const logData = {
        timestamp: new Date().toISOString(),
        level,
        message, // include Lambda context (reqId, userId etc.)
      }
      return JSON.stringify(logData)
    })

    this.log = createLogger({
      format: combine(timestamp(), myFormat),
      transports: [
        new winston.transports.Console({
          handleExceptions: true,
        }),
      ],
      exitOnError: false,
    })

    this.setLoggerMethods()
  }

  private setLoggerMethods() {
    this.logger = {
      error: (message: string, meta?: any) => this.log.error(JSON.stringify({ message, meta })),
      warn: (message: string, meta?: any) => this.log.warn(JSON.stringify({ message, meta })),
      info: (message: string, meta?: any) => this.log.info(JSON.stringify({ message, meta })),
      debug: (message: string, meta?: any) => this.log.debug(JSON.stringify({ message, meta })),
      success: (message: string, meta?: any) => this.log.info(JSON.stringify({ success: true, message, meta })),
    }
  }

  public static get Instance() {
    if (!this.instance) this.instance = new LoggerProvider()
    return this.instance
  }
}
