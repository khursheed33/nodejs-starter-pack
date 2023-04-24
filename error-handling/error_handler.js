const logger = require('./logger');

function errorHandler(err, req, res, next) {
  logger.error(err.stack);
  res.status(500).send('Internal server error');
}

module.exports = errorHandler;
