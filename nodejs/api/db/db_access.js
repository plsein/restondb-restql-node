const { Config } = require('../configs/config');
const { Utils } = require('../utils/utils');
const { Sequelize } = require('sequelize');
const { sequelize, queryInterface, QueryTypes } = require('./db');
const { appLog } = require('../configs/logger');

class DbAccess {

  /**
   * Function bindOrReplace
   * @param object bind_params
   * @returns object
   */
  static bindOrReplace = function(bind_params) {
    return (Config['DEBUG'])? { replacements: bind_params } : { bind: bind_params };
  };

  /**
   * Function allTableNames
   * @return array
   */
  static allTables = async function() {
    let db_schemas = "'" + Config['DB_SCHEMA'].split(",").join("','") + "'";
    let sql_query = "SELECT table_name FROM information_schema.tables WHERE table_schema IN (" + db_schemas + ")";
    return await sequelize.query(sql_query, { type: QueryTypes.SELECT });
  };

  /**
   * Function columnComments
   * @param string table
   * @param string schema
   * @return array
   */
  static columnComments = async function(table, schema='') {   // , fields
    let db_schemas = (typeof schema == 'string' && schema.length > 0)? "'" + schema + "'" : "'" + Config['DB_SCHEMA'].split(",").join("','") + "'";
    let table_name = Utils.escapeString(table);
    // let table_fields = "'" + fields.join("','") + "'";
    let sql_query = "SELECT table_schema, table_name, column_name, COL_DESCRIPTION((table_schema||'.'||table_name)::regclass::oid, ordinal_position) AS column_comment "
      + " FROM information_schema.columns WHERE table_schema IN (" + db_schemas + ") AND table_name='"+table_name+"'"
      + " AND col_description((table_schema||'.'||table_name)::regclass::oid, ordinal_position) IS NOT null";   //  AND column_name IN ("+table_fields+")
      // console.log("c-sql: ", await sequelize.query(sql_query, { type: QueryTypes.SELECT }));
      return await sequelize.query(sql_query, { type: QueryTypes.SELECT });
  };

  /**
   * Function selectData
   * @param string sql_query
   * @param object bind_params
   * @return array
   */
  static selectData = async function(sql_query, bind_params) {
    console.log('Debug: ', Config['DEBUG']);
    const [results, metadata] = await sequelize.query(sql_query, this.bindOrReplace(bind_params));
    appLog.debug('metadata: ', metadata);
    return results;
  };

  /**
   * Function insertData
   * @param string table
   * @param array records
   * @returns any
   */
  static insertData = async function(table, records) {
    return await queryInterface.bulkInsert(table, records);
  };

  /**
   * Function updateData
   * @param string table
   * @param array record
   * @param string sql_where
   * @param object bind_params
   * @returns any
   */
  static updateData = async function(table, record, sql_where, bind_params) {
    let where = (Utils.isObject(bind_params) && Object.keys(bind_params).length > 0)? bind_params : Sequelize.literal(Utils.escapeString(sql_where));
    return await queryInterface.bulkUpdate(table, record, where);
  };

  /**
   * Function deleteData
   * @param string table
   * @param string sql_where
   * @param object bind_params
   * @returns any
   */
  static deleteData = async function(table, sql_where, bind_params) {
    let where = (Utils.isObject(bind_params) && Object.keys(bind_params).length > 0)? bind_params : Sequelize.literal(Utils.escapeString(sql_where));
    return await queryInterface.bulkDelete(table, where);
  };

};

exports.DbAccess = DbAccess;
