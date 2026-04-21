/**
 * Structured logger — JSON in production, human-readable in dev.
 * Zero external dependencies.
 *
 * Usage:
 *   import logger from '../utils/logger.js';
 *   logger.info('Customer added', { userId, customerId });
 *   logger.error('Call failed', { err: e.message, toNumber });
 */

const isProd = process.env.NODE_ENV === 'production';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN_LEVEL = isProd ? LEVELS.info : LEVELS.debug;

function serializeError(err) {
  if (!err || typeof err !== 'object') return err;
  return {
    message: err.message,
    code: err.code,
    status: err.status || err.statusCode,
    // Only include stack in non-production
    ...(isProd ? {} : { stack: err.stack }),
  };
}

function normalizeMetaErr(meta = {}) {
  if (!meta || typeof meta !== 'object') return meta;
  const out = { ...meta };
  // Allow callers to pass { err: errorObject } and get it serialized
  if (out.err instanceof Error) out.err = serializeError(out.err);
  if (out.error instanceof Error) out.error = serializeError(out.error);
  return out;
}

function write(level, msg, meta = {}) {
  if (LEVELS[level] < MIN_LEVEL) return;

  const normalizedMeta = normalizeMetaErr(meta);

  if (isProd) {
    const entry = {
      ts: new Date().toISOString(),
      level,
      msg: String(msg),
      ...normalizedMeta,
    };
    process.stdout.write(JSON.stringify(entry) + '\n');
  } else {
    const prefix = {
      debug: '\x1b[36m[DEBUG]\x1b[0m',
      info: '\x1b[32m[INFO]\x1b[0m ',
      warn: '\x1b[33m[WARN]\x1b[0m ',
      error: '\x1b[31m[ERROR]\x1b[0m',
    }[level];
    const metaStr =
      Object.keys(normalizedMeta).length
        ? '  ' + JSON.stringify(normalizedMeta)
        : '';
    const out = `${prefix} ${String(msg)}${metaStr}`;
    if (level === 'error') process.stderr.write(out + '\n');
    else process.stdout.write(out + '\n');
  }
}

const logger = {
  debug: (msg, meta) => write('debug', msg, meta),
  info: (msg, meta) => write('info', msg, meta),
  warn: (msg, meta) => write('warn', msg, meta),
  error: (msg, meta) => write('error', msg, meta),

  /** Morgan-compatible write stream for HTTP request logging */
  stream: {
    write: (message) => write('info', message.trimEnd(), { type: 'http' }),
  },
};

export default logger;
