import { PrismaClient } from '@prisma/client';
import { logger } from '@messanger/utils/src/loggers';

export const prismaClient = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

// ANSI color codes
const color = {
  query: '\x1b[36m', // cyan
  error: '\x1b[31m', // red
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  reset: '\x1b[0m',
};

prismaClient.$on('query', (e: { query: any; params: any }) => {
  logger.debug(`${color.query}[ QUERY ]${color.reset} ${e.query} - Params: ${e.params}`);
});

prismaClient.$on('error', (e: { message: any }) => {
  logger.error(`${color.error}[ ERROR ]${color.reset} ${e.message}`);
});

prismaClient.$on('info', (e: { message: any }) => {
  logger.info(`${color.info}[ INFO ]${color.reset} ${e.message}`);
});

prismaClient.$on('warn', (e: { message: any }) => {
  logger.warn(`${color.warn}[ WARN ]${color.reset} ${e.message}`);
});
