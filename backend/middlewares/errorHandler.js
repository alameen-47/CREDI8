import logger from '../utils/logger.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Always log 5xx errors with full context
  if (status >= 500) {
    logger.error('Unhandled error', {
      err: {
        message: err.message,
        code: err.code,
        stack: err.stack,
      },
      req: {
        method: req.method,
        url: req.originalUrl,
        userId: req.user?._id,
      },
    });
  } else if (status >= 400) {
    logger.warn('Client error', {
      status,
      message: err.message,
      code: err.code,
      url: req.originalUrl,
    });
  }

  const message =
    status >= 500 && isProd
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    code: err.code || (status >= 500 ? 'SERVER_ERROR' : 'REQUEST_ERROR'),
    message,
  });
}
