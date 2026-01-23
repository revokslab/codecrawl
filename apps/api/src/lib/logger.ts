import { configDotenv } from 'dotenv';
import * as winston from 'winston';

configDotenv();

const logFormat = winston.format.printf(
  (info) =>
    `${info.timestamp} ${info.level} [${(info.metadata as any).module ?? ''}:${
      (info.metadata as any).method ?? ''
    }]: ${info.message} ${
      info.level.includes('error') || info.level.includes('warn')
        ? JSON.stringify(info.metadata, (_, value) => {
            if (value instanceof Error) {
              return {
                ...value,
                name: value.name,
                message: value.message,
                stack: value.stack,
              };
            } else {
              return value;
            }
          })
        : ''
    }`,
);

export const logger = winston.createLogger({
  level: process.env.LOGGING_LEVEL?.toLowerCase() ?? 'debug',
  format: winston.format.json({
    replacer(key, value) {
      if (value instanceof Error) {
        return {
          ...value,
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      } else {
        return value;
      }
    },
  }),
  transports: [
    ...(process.env.CODECRAWL_LOG_TO_FILE
      ? [
          new winston.transports.File({
            filename: `codecrawl-${process.argv[1].includes('worker') ? 'worker' : 'app'}-${crypto.randomUUID()}.log`,
          }),
        ]
      : []),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.metadata({
          fillExcept: ['message', 'level', 'timestamp'],
        }),
        ...((process.env.NODE_ENV === 'production' &&
          process.env.SENTRY_ENVIRONMENT === 'dev') ||
        process.env.ENV !== 'production'
          ? [winston.format.colorize(), logFormat]
          : []),
      ),
    }),
  ],
});
