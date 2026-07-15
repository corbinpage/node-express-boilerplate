const Joi = require('joi');
const httpStatus = require('http-status').default;
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  // Express 5 exposes `req.query` as a read-only getter, so assign the validated
  // segments individually and redefine `query` as an own (writable) property.
  Object.keys(value).forEach((key) => {
    if (key === 'query') {
      Object.defineProperty(req, 'query', { value: value.query, writable: true, configurable: true, enumerable: true });
    } else {
      req[key] = value[key];
    }
  });
  return next();
};

module.exports = validate;
