import { Env } from './interface'
import { Algorithm } from 'jsonwebtoken'
import { Dialect } from 'sequelize'

const envConfig: Env = {
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'],
  SQL_DATABASE: process.env.SQL_DATABASE ?? 'credge',
  SQL_HOST: process.env.SQL_HOST ?? '',
  SQL_PORT: Number(process.env.SQL_PORT ?? 5432),
  SQL_USER: process.env.SQL_USER ?? '',
  SQL_PASSWORD: process.env.SQL_PASSWORD ?? '',
  SQL_LOG: String(process.env.SQL_LOG) === 'true',
  ALTER_TABLE: String(process.env.ALTER_TABLE) === 'true',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE ?? 'mysecret',
  JWT_ISSUER: process.env.JWT_ISSUER ?? 'mysecret',
  JWT_ALGO: (process.env.JWT_ALGO ?? 'HS256') as Algorithm,
  JWT_EXPIRES_IN: Number(process.env.JWT_EXPIRES_IN ?? 3600),
  NETWORK_WEBHOOK_SECRET: process.env.NETWORK_WEBHOOK_SECRET ?? 'mysecret',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
}

const configSqlDb = {
  database: envConfig.SQL_DATABASE,
  dialect: 'postgres' as Dialect,
  host: envConfig.SQL_HOST,
  port: envConfig.SQL_PORT,
  username: envConfig.SQL_USER,
  password: envConfig.SQL_PASSWORD,
  useNativeUUID: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    connectTimeout: 60000,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ],
    max: 3,
  },
  logging: (str: string) => {
    if (envConfig.SQL_LOG === true) console.log(str)
  },
  define: {
    freezeTableName: true,
  },
}

export { envConfig, configSqlDb }
