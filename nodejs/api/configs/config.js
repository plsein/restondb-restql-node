
require("dotenv").config();

class Config {

  static DEBUG = process.env.DEBUG;

  static JWT_AUTH_SECRET = process.env.JWT_AUTH_SECRET;

  static APP_PORT = process.env.APP_PORT;

  static DATABASE = process.env.DATABASE;

  static DIALECT = process.env.DIALECT;

  static DB_HOST = process.env.DB_HOST;

  static DB_PORT = process.env.DB_PORT;

  static DB_NAME = process.env.DB_NAME;

  static DB_USER = process.env.DB_USER;

  static DB_SCHEMA = process.env.DB_SCHEMA;

  static DB_PASS = process.env.DB_PASS;

  static DB_POOL_MIN = process.env.DB_POOL_MIN;

  static DB_POOL_MAX = process.env.DB_POOL_MAX;
  
  static DB_POOL_IDLE = process.env.DB_POOL_IDLE;
  
  static DB_POOL_ACQUIRE = process.env.DB_POOL_ACQUIRE;
  
  static DB_POOL_EVICT = process.env.DB_POOL_EVICT;
  
  static DB_POOL_MAXUSES = process.env.DB_POOL_MAXUSES;

  static DB_URI = process.env.DATABASE + '://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME;

  static AUTH_KEY = process.env.AUTH_KEY;

  static SECRET_KEY = process.env.AUTH_SECRET;

  static TOKEN_EXPIRY_MILLISEC = process.env.TOKEN_EXPIRY_MILLISEC;

  static LOG_DIR = process.env.LOG_DIR;

}

exports.Config = Config;
