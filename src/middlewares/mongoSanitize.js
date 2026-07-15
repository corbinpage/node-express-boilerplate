const mongoSanitize = require('express-mongo-sanitize');

/**
 * Express 5-compatible replacement for the stock `express-mongo-sanitize()`
 * middleware. The stock middleware reassigns `req.query`, which throws on
 * Express 5's read-only getter. This sanitizes `body`/`params` in place and
 * redefines `query` as an own property (Express 5 re-parses the query getter
 * on every access, so in-place mutation would not persist).
 * @returns {Function}
 */
const sanitize = () => (req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body, {});
  if (req.params) mongoSanitize.sanitize(req.params, {});
  if (req.query) {
    Object.defineProperty(req, 'query', {
      value: mongoSanitize.sanitize({ ...req.query }, {}),
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
};

module.exports = sanitize;
