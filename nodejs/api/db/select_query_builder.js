
const { CommonUtils } = require('../utils/common_utils');
const { DbAccess } = require('./db_access');

/**
 * Select Query SQL Builder
 */
class SelectQueryBuilder {

  /**
   * Restrict tables
   */
  static _restrictTables = true;

  /**
   * Default limit
   */
  static _sqlDefaultLimit = 10;

  /**
   * Initial response
   */
  static _initialResp = {'msg':{}, 'sql_query':''};

  /**
   * Functions for select clauses
   */
  static _selectClauseFnSeq = ['select', 'inner', 'left', 'where', 'group', 'having', 'sort', 'limit', 'offset', 'bind'];

  /**
   * All table names
   */
  static _allTableNames = [];

  /**
   * Merge two objects
   * @param resp object
   * @param res object
   * @returns object
   */
  static mergeResp = async (resp, res) => {
    if(CommonUtils.isObject(resp) && CommonUtils.isObject(res)) {
      if ('msg' in resp && 'msg' in res) {
        resp['msg'] = Object.assign(resp['msg'], res['msg']);
      }
      if ('sql_query' in resp && 'sql_query' in res) {
        resp['sql_query'] = resp['sql_query'] + ' ' + res['sql_query'];
      }
      return resp;
    }
    return {};
  };

  /**
   * All Tables
   */
  static tables = async () => {
    if (this._allTableNames.length > 0) {
      return this._allTableNames;
    } else {
      let allTables = await DbAccess.allTables();
      this._allTableNames = allTables.map(function(rec) { return rec['table_name']; });   // rec[0]
      return this._allTableNames;
    }
  };

  /**
   * Restrict tables access
   * @returns boolean
   */
  static restrictTablesAccess = async (table) => {
    table = (table.includes(' '))? table.substring(0, table.indexOf(' ')).trim() : table.trim();
    if (table.length > 0) {
      if (this._restrictTables) {
        let tableNames = await this.tables();
        return tableNames.includes(table);
      }
      return true;
    }
    return false;
  };

  /**
   * Select from table
   * @param table string
   * @param retTableName boolean
   * @returns array
   */
  static table = async (table, retTableName=false) => {
    let resp = this._initialResp;
    if ((typeof table == 'string')) {
      let sql_table = CommonUtils.escapeString(table);
      if (sql_table.length > 0) {
        if (! await this.restrictTablesAccess(sql_table)) {
          resp['msg']['table'] = "can't access internal table";
        }
        if (retTableName) {
          return sql_table;
        }
        resp['sql_query'] = "SELECT * FROM " + sql_table;
      } else {
        resp['msg']['table'] = "table must be a valid string";
      }
    } else {
      resp['msg']['table'] = "table must be a string";
    }
    return resp;
  };

  /**
   * Select fields from table
   * @param fields array
   * @param table string
   * @returns array
   */
  static select = async (fields, table) => {
    let resp = this._initialResp;
    let res = await this.table(table);
    resp = await this.mergeResp(resp, res);
    let table_name = await this.table(table, true);
    let sql_table = ('table' in resp['msg'])? table: table_name;
    if(!Array.isArray(fields)) {
      resp['msg']['fields'] = "fields must be an array";
    } else if(fields.length > 0) {
      let sql_fields = CommonUtils.escapeString(fields.join(', '));
      sql_fields = (sql_fields.trim().length > 0)? sql_fields : '*';
      resp['sql_query'] = "SELECT " + sql_fields + " FROM " + sql_table;
    }
    return resp;
  };

  /**
   * Inner join
   * @param resp array
   * @param inner array
   * @return array
   */
  static inner = async (resp, inner) => {
    if(!Array.isArray(inner)) {
      resp['msg']['inner'] = "inner must be an array";
    } else if(inner.length > 0) {
      let sql_inner = ' ';   // CommonUtils.escapeString(inner.join(' '));
      for (const inner_table of inner) {
        if (CommonUtils.isObject(inner_table) && Object.keys(inner_table).includes('table') && Object.keys(inner_table).includes('relation')) {
          let inner_table_name = await this.table(inner_table['table'], true);
          let inner_table_rel = CommonUtils.escapeString(inner_table['relation']);
          if (inner_table_name.length > 0 && inner_table_rel.length > 0) {
            sql_inner = sql_inner + " INNER JOIN " + inner_table_name + " ON " + inner_table_rel;
          }
        } else {
          resp['msg']['inner'] = "inner must have a valid table and relation";
        }
      }
      if (sql_inner.trim().length > 0) {
        resp['sql_query'] = resp['sql_query'] + sql_inner;
      } else {
        resp['msg']['inner'] = "inner must be a valid array";
      }
    }
    return resp;
  };

  /**
   * Left join
   * @param resp array
   * @param left array
   * @return array
   */
  static left = async (resp, left) => {
    if(!Array.isArray(left)) {
      resp['msg']['left'] = "left must be an array";
    } else if(left.length > 0) {
      let sql_left = ' ';
      for (const left_table of left) {
        if (CommonUtils.isObject(left_table) && Object.keys(left_table).includes('table') && Object.keys(left_table).includes('relation')) {
          let left_table_name = await this.table(left_table['table'], true);
          let left_table_rel = CommonUtils.escapeString(left_table['relation']);
          if (left_table_name.length > 0 && left_table_rel.length > 0) {
            sql_left = sql_left + " LEFT JOIN " + left_table_name + " ON " + left_table_rel;
          }
        } else {
          resp['msg']['left'] = "left must have a valid table and relation";
        }
      }
      if (sql_left.trim().length > 0) {
        resp['sql_query'] = resp['sql_query'] + sql_left;
      } else {
        resp['msg']['left'] = "left must be a valid array";
      }
    }
    return resp;
  };

  /**
   * Where condition
   * @param resp array
   * @param where string
   * @return array
   */
  static where = async (resp, where) => {
    if (typeof where != 'string') {
      resp['msg']['where'] = "where must be a string";
    } else if (where.length > 0) {
      let sql_where = CommonUtils.escapeString(where);
      if (sql_where.trim().length > 0) {
        resp['sql_query'] = resp['sql_query'] + " WHERE " + sql_where;
      } else {
        resp['msg']['where'] = "where must be a valid string";
      }
    }
    return resp;
  };

  /**
   * Group by
   * @param resp array
   * @param group array
   * @return array
   */
  static group = async (resp, group) => {
    if (!Array.isArray(group)) {
      resp['msg']['group'] = "group must be an array";
    } else if(group.length > 0) {
      let sql_group = CommonUtils.escapeString(group.join(', '));
      if (sql_group.trim().length > 0) {
        resp['sql_query'] = resp['sql_query'] + " GROUP BY " + sql_group;
      } else {
        resp['msg']['group'] = "group must be a valid array";
      }
    }
    return resp;
  };

  /**
   * Having condition
   * @param resp array
   * @param having string
   * @return array
   */
  static having = async (resp, having) => {
    if (typeof having != 'string') {
      resp['msg']['having'] = "having must be a string";
    } else if (having.length > 0) {
      let sql_having = CommonUtils.escapeString(having);
      if (sql_having.trim().length > 0) {
        resp['sql_query'] = resp['sql_query'] + " HAVING " + sql_having;
      } else {
        resp['msg']['having'] = "having must be a valid string";
      }
    }
    return resp;
  };

  /**
   * Sort order
   * @param resp array
   * @param sort array
   * @return array
   */
  static sort = async (resp, sort) => {
    if (!Array.isArray(sort)) {
      resp['msg']['sort'] = "sort must be an array";
    } else if(sort.length > 0) {
      let sql_sort = CommonUtils.escapeString(sort.join(', '));
      if (sql_sort.trim().length > 0) {
        resp['sql_query'] = resp['sql_query'] + " ORDER BY " + sql_sort;
      } else {
        resp['msg']['sort'] = "sort must be a valid array";
      }
    }
    return resp;
  };

  /**
   * Limit
   * @param resp array
   * @param limit array
   * @return array
   */
  static limit = async (resp, limit) => {
    if ((typeof limit == 'string' || typeof limit == 'number') && !isNaN(parseInt(limit, 10))) {
      limit = parseInt(limit, 10);
      if(limit > 0) {
        resp['sql_query'] = resp['sql_query'] + " LIMIT " + limit;
      } else {
        resp['sql_query'] = resp['sql_query'] + " LIMIT " + this._sqlDefaultLimit;
        // resp['msg']['limit'] = "limit must be a valid integer";
      }
    } else {
      resp['sql_query'] = resp['sql_query'] + " LIMIT " + this._sqlDefaultLimit;
      // resp['msg']['limit'] = "limit must be an integer";
    }
    return resp;
  };

  /**
   * Offset
   * @param resp array
   * @param offset array
   * @return array
   */
  static offset = async (resp, offset) => {
    if ((typeof offset == 'string' || typeof offset == 'number') && !isNaN(parseInt(offset, 10))) {
      offset = parseInt(offset, 10);
      if(offset >= 0) {
        resp['sql_query'] = resp['sql_query'] + " OFFSET " + offset;
      } else {
        resp['msg']['offset'] = "offset must be a valid integer";
      }
    } else {
      resp['msg']['offset'] = "offset must be an integer";
    }
    return resp;
  };

  /**
   * Bind params
   * @param resp array
   * @param bind array
   * @return array
   */
  static bind = async (resp, bind) => {
    if (bind && CommonUtils.isObject(bind) && Object.keys(bind).length > 0) {
      resp['bind_params'] = bind;
    } else if (bind && !CommonUtils.isObject(bind)) {
      resp['msg']['bind'] = "bind must be key value pairs";
    }
    return resp;
  };

  /**
   * Function builder
   * @param params array
   * return array
   */
  static build = async (params) => {
    let resp = [];
    for (const fn of this._selectClauseFnSeq) {
      if (fn == 'select') {
        resp = await this[fn](params['fields'], params['table']);
      } else {
        resp = await this[fn](resp, params[fn]);
      }
    }
    return resp;
  };

};

exports.SelectQueryBuilder = SelectQueryBuilder;
