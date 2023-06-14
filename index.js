const bunyan = require('./lib/bunyan')
const expressBunyan = require('./lib/http')

module.exports = anatomic
module.exports.middleware = middleware
module.exports.createLogger = createLogger
module.exports.createMiddleware = createMiddleware

function anatomic () {
  let logger

  async function start ({ config, tracer = {} }) {
    logger = createLogger(config, tracer)

    return logger
  }

  return { start }
}

function middleware () {
  async function start ({ app, config, logger }) {
    if (!app) throw new Error('app is required')
    if (!logger) throw new Error('logger is required')

    app.use(createMiddleware(logger, config))
  }

  return { start }
}

function createLogger (config = {}, tracer) {
  const opts = { ...config, tracer }
  const logger = bunyan.createLogger(opts)

  logger.middleware = cfg => createMiddleware(logger, cfg)

  return logger
}

function createMiddleware (logger, config = {}) {
  logger = logger || createLogger()
  const opts = { logger, ...{ obscureHeaders: [ 'Authorization' ] }, ...config }
  return expressBunyan(opts)
}
