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
  const message =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    success: false,
    code: err.code || 'SERVER_ERROR',
    message,
  });
}
