// middleware/logger.js
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        timestamp: new Date().toISOString(),
        level: res.statusCode >= 400 ? 'error' : 'info',
        requestId,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent')
      };
  
      if (res.statusCode >= 400) {
        logData.error = res.locals.error || 'Unknown error';
      }
  
      console.log(JSON.stringify(logData));
    });
  
    next();
  };