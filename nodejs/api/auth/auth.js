/**
 * Imports
 */
const jwt = require("jsonwebtoken");
const { Config } = require('../configs/config');
const { CommonUtils } = require('../utils/common_utils');
const { errorHandler } = require('../middlewares/middleware');

class Auth {

  /**
   * Auth token generator
  */
  // app.post("/token", async (req, res, next) => {
  static #authToken = (key, secret) => {
    // Can connect to db as below
    // const pgclient = await getPGPool().connect();
    // const resp = await pgclient.query('SELECT * from table_name');
    // console.log('rows: ', resp.rows);
    if(key === Config['AUTH_KEY'] && secret === Config['SECRET_KEY']) {
      return {
        "token": jwt.sign(
          {role: Config['DB_USER'], user_id: 0},  // payload
          Config['JWT_AUTH_SECRET'],
          {algorithm: "HS256", expiresIn: Config['TOKEN_EXPIRY_MILLISEC']}  // Milliseconds
        )
      };
    } else {
      throw new Error("Authentication Error");
    }
  };

  static getToken = (req, res, next) => {
    let key = req.body.key? req.body.key: '';
    let secret = req.body.secret? req.body.secret: '';
    try {
      return CommonUtils.sendResponse(res, Auth.#authToken(key, secret));
    } catch(err) {
      err['status'] = 401;
      errorHandler(err, req, res, next);
    }
  }

}

exports.Auth = Auth;
