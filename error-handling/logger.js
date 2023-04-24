const { createLogger, transports, format } = require('winston');

const errorTransport = new transports.File({
  filename: 'logs/error.log',
  level: 'error',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
});

const warningTransport = new transports.File({
  filename: 'logs/warning.log',
  level: 'warn',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
});

const logger = createLogger({
  transports: [
    errorTransport,
    warningTransport
  ]
});

module.exports = logger;
