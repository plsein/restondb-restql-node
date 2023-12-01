const httpStatus = require('http-status');
const { CommonUtils } = require('../utils/common_utils');

/**
 * Error handler function
 * @param {*} err Error Object
 * @param {*} req Request Object
 * @param {*} res Response Object
 * @param {*} next Next process
 */
exports.errorHandler = (err, req, res, next) => {
  if (err && next && res.headersSent) {
    return next(err);
  } else if (err) {
    // Log the error but don't send back internal operational details like a stack trace to the client!
    CommonUtils.reqLog(req, err.message);
    if (err.msg) {
      err.msg = (err.msg?.error)? err.msg['error'] : err.msg;
    } else if (err.status == 400) {
      err.msg = 'Bad Request';
    } else if (err.status == 500 || err.status == 501) {
      err.msg = 'Server Error';
    } else {
      err.msg = httpStatus[err.status];
    }
    return res.status(err.status).json({"code":err.status, "msg": {"error": err.msg}, "data":[] });
    // res.end();
  } else if (next) {
    return next();
  }
  return false;
};

/**
 * Initial / first middleware
 * @param {*} req Request object
 * @param {*} res Response object
 * @param {*} next Next process
 */
exports.initMiddleware = (req, res, next) => {
  return next();
}
