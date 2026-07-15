const { filterXSS } = require('xss');

/**
 * Recursively sanitize every string value in an object/array in place, stripping
 * potential XSS payloads. Mutates in place (rather than reassigning) so it works
 * even when the target is a read-only getter such as Express 5's `req.query`.
 * @param {*} obj
 * @returns {*}
 */
const clean = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === 'string') {
      // eslint-disable-next-line no-param-reassign
      obj[key] = filterXSS(value);
    } else if (typeof value === 'object') {
      clean(value);
    }
  });
  return obj;
};

/**
 * Express middleware that sanitizes user-supplied data (body, query, params)
 * against XSS. Maintained replacement for the abandoned `xss-clean` package.
 * @returns {Function}
 */
const xss = () => (req, res, next) => {
  if (req.body) clean(req.body);
  if (req.query) clean(req.query);
  if (req.params) clean(req.params);
  next();
};

module.exports = xss;
