const { Config } = require('../configs/config');
const { CommonUtils } = require('../utils/common_utils');
const { Sequelize } = require('sequelize');
const { sequelize, queryInterface, QueryTypes } = require('./db');
const { appLog } = require('../configs/logger');

class DbAccess {

  /**
   * Function bindOrReplace
   * @param object bind_params
   * @returns object
   */
  static bindOrReplace = (bind_params) => {
    return (Config['DEBUG'])? { replacements: bind_params } : { bind: bind_params };
  };

  /**
   * Function allTableNames
   * @return array
   */
  static allTables = async () => {
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
  static columnComments = async (table, schema='') => {   // , fields
    let db_schemas = (typeof schema == 'string' && schema.length > 0)? "'" + schema + "'" : "'" + Config['DB_SCHEMA'].split(",").join("','") + "'";
    let table_name = CommonUtils.escapeString(table);
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
  static selectData = async (sql_query, bind_params) => {
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
  static insertData = async (table, records) => {
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
  static updateData = async (table, record, sql_where, bind_params) => {
    let where = (CommonUtils.isObject(bind_params) && Object.keys(bind_params).length > 0)? bind_params : Sequelize.literal(CommonUtils.escapeString(sql_where));
    return await queryInterface.bulkUpdate(table, record, where);
  };

  /**
   * Function deleteData
   * @param string table
   * @param string sql_where
   * @param object bind_params
   * @returns any
   */
  static deleteData = async (table, sql_where, bind_params) => {
    let where = (CommonUtils.isObject(bind_params) && Object.keys(bind_params).length > 0)? bind_params : Sequelize.literal(CommonUtils.escapeString(sql_where));
    return await queryInterface.bulkDelete(table, where);
  };

};

exports.DbAccess = DbAccess;
