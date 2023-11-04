const { Pool, Client } = require('pg');
const { Sequelize, QueryTypes } = require('sequelize');
const { Config } = require('../configs/config');
// const format = require('pg-format');

/**
* Database connection
*/
/* Uncomment if required, though mostly not required
function getPGPool() {
  const pool = new Pool({
    host: Config['DB_HOST'],
    port: Config['DB_PORT'],
    database: Config['DB_NAME'],
    user: Config['DB_USER'],
    password: Config['DB_PASS'],
  });
  pool.on("error", (err, client) => {
    console.error("Unexpected error during connection", err);
  });
  pool.query("SET search_path TO '"+Config['DB_SCHEMA']+"';");
  return pool;
}
*/

/**
* ORM connection
*/
const sequelize = new Sequelize(Config['DB_NAME'], Config['DB_USER'], Config['DB_PASS'], {
  dialect: Config['DIALECT'],
  host: Config['DB_HOST'],
  port: Config['DB_PORT'],
  schema: Config['DB_SCHEMA'],
  searchPath: Config['DB_SCHEMA'],
  // logging: (...msg) => console.log(msg),
  pool: {
    min: parseInt(Config['DB_POOL_MIN']),
    max: parseInt(Config['DB_POOL_MAX']),
    idle: parseInt(Config['DB_POOL_IDLE']),
    acquire: parseInt(Config['DB_POOL_ACQUIRE']),
    evict: parseInt(Config['DB_POOL_EVICT']),
    maxUses: parseInt(Config['DB_POOL_MAXUSES']),
  },
  dialectOptions: {
    prependSearchPath: true
  },
  define: {
    // underscored: false,
    // freezeTableName: false,
    charset: 'utf8',
    dialectOptions: {
      collate: 'utf8_general_ci',
    },
    // schema: Config['DB_SCHEMA']
    // timestamps: true
  },
});

/**
 * Start connection
 */
(async() => {
  try {
    await sequelize.authenticate();
    // console.log('sequelize: ', await sequelize.showAllSchemas());
    console.log('DB connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

/**
 * Initialize query interface object
 */
const queryInterface = sequelize.getQueryInterface();

exports.sequelize = sequelize;
exports.queryInterface = queryInterface;
exports.QueryTypes = QueryTypes;
