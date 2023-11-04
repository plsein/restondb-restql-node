const { Sequelize } = require('sequelize');
const { errorHandler } = require('../middlewares/middleware');
const { PGSelectQueryBuilder } = require('../db/pg_select_query_builder');
const { DbAccess } = require('../db/db_access');
const { Utils } = require('../utils/utils');
const { Validate } = require('../validations/validate');

class Service {

  /**
   * Select api.
   * Sample input json: {
   *   "fields": ["sum(z.zone_id) as sum_zone_id", "sum(z.zone_id)/2 as half_sum_zone_id", "cr.region_name as region_name", "csp.provider_name"],
   *   "table": "zones z",
   *   "inner": ["cloud_regions cr on cr.region_id = z.region_id"],
   *   "left": ["cloud_service_providers csp on csp.provider_id = cr.provider_id"],
   *   "where": "z.zone_id > 0",
   *   "group": ["z.zone_id", "cr.region_name", "csp.provider_name"],
   *   "having": "sum(z.zone_id) > 100",
   *   "sort": ["z.zone_name asc"],
   *   "limit": 2,
   *   "offset": 1
   * }
   * @param {*} req request object
   * @param {*} res response object
   * @param {*} next callback
   * @returns JSON object
   */
  static select = async function(req, res, next) {
    let params = {};
    params['fields'] = req.body.fields? req.body.fields: ['*'];
    params['table'] = req.body.table? req.body.table: '';
    params['inner'] = req.body.inner? req.body.inner: [];
    params['left'] = req.body.left? req.body.left: [];
    params['where'] = req.body.where? req.body.where: '';
    params['group'] = req.body.group? req.body.group: [];
    params['having'] = req.body.having? req.body.having: '';
    params['sort'] = req.body.sort? req.body.sort: [];
    params['limit'] = req.body.limit? req.body.limit: '';
    params['offset'] = req.body.offset? req.body.offset: '0';
    params['bind'] = req.body.bind? req.body.bind: {};
    let data = [];
    let resp = {};
    resp = await PGSelectQueryBuilder.build(params);
    if (Object.keys(resp['msg']).length > 0) {
      return Utils.sendResponse(res, data, 400, resp['msg']);
    }
    if (resp['sql_query'].length > 0) {
      try {
        let bind_params = ('bind_params' in resp && Utils.isObject(resp['bind_params']))? resp['bind_params'] : {};
        data = await DbAccess.selectData(resp['sql_query'], bind_params);
        data = (typeof data[1] !== 'undefined' && 'rows' in data[1])? data[1]['rows'] : data;
      } catch(err) {
        err['status'] = 400;
        err['msg'] = err.message;
        return errorHandler(err, req, res, next);
      }
      return Utils.sendResponse(res, data);
    }
    return Utils.sendResponse(res, data, 400, {"error":"Data Error"});
  };

  /**
   * Add api.
   * Sample input json: {
   *   "table": "zones",
   *   "records": [{
   *     "zone_name": "test zone 104",
   *     "region_id": 41
   *   },{
   *     "zone_name": "test zone 105",
   *     "region_id": 41
   *   }]
   * }
   * @param {*} req request object
   * @param {*} res response object
   * @param {*} next callback
   * @returns JSON object
   */
  static add = async function(req, res, next) {
    let schema = (req.body.schema)? req.body.schema : '';
    let table = req.body.table? req.body.table: '';
    let records = req.body.records? req.body.records: [];
    let msg = {};
    let data = [];
    let rules = {};
    let vmsg = {};
    let idx = 0;
    if (!(typeof table == 'string')) {
      msg['table'] = "table must be a string";
    } else if (table.length > 0) {
      if (!Array.isArray(records)) {
        msg['records'] = "records must be an array";
      }
    }
    // data validation
    msg['validations'] = {};
    // rules = await Validate.getTableRules(table, schema);
    // for (const record of records) {
    // if (isObject(rules) && Object.keys(rules).length > 0) {
    vmsg = await Validate.check(records, table);  // rules
    if (Utils.isObject(vmsg) && Object.keys(vmsg).length > 0) {
      msg['validations'] = vmsg;
      vmsg = null;
    }
    // }
    // }
    if(Object.keys(msg['validations']).length < 1) {
      delete msg['validations'];
    }
    if (Object.keys(msg).length > 0) {
      let err = {};
      err['status'] = 400;
      err['msg'] = msg;
      return errorHandler(err, req, res, next);
    }
    if(records.length > 0) {
      try {
        data = await DbAccess.insertData(table, records);
      } catch(err) {
        err['status'] = 400;
        err['msg'] = err.message;
        return errorHandler(err, req, res, next);
      }
      return Utils.sendResponse(res, data);
    }
    return Utils.sendResponse(res, data, 400, {"error":"Data Error"});
  };

  /**
   * Edit api.
   * Sample input json: {
   *   "objects": [{
   *     "table": "zones",
   *     "where": "zone_id=158",
   *     "bind": {"zone_id": 158},
   *     "record":{
   *       "zone_name": "test zone 108",
   *       "region_id": 41
   *     }
   *   }, {
   *     "table": "zones",
   *     "where": "zone_id=159",
   *     "bind": {"zone_id": 159},
   *     "record": {
   *       "zone_name": "test zone 109",
   *       "region_id": 41
   *     }
   *   }]
   * }
   * @param {*} req request object
   * @param {*} res response object
   * @param {*} next callback
   * @returns JSON object
   */
  static edit = async function(req, res, next) {
    let objects = req.body.objects? req.body.objects: [];
    let msg = {};
    let data = [];
    let idx = 0;
    let vmsg = {};
    if (!Array.isArray(objects)) {
      msg['0']['objects'] = "objects must be an array";
    }
    if (Object.keys(objects).length > 0) {
      for (const obj in objects) {
        msg[''+idx] = {};
        let schema = (objects[obj]['schema'])? objects[obj]['schema'] : '';
        let table = (objects[obj]['table'])? objects[obj]['table'] : '';
        let where = (objects[obj]['where'])? objects[obj]['where'] : '';
        let record = (objects[obj]['record'])? objects[obj]['record'] : {};
        let bind_params = (objects[obj]['bind'])? objects[obj]['bind']: {};
        let schemaTable = table;
        if (!(typeof schema == 'string')) {
          msg[''+idx]['schema'] = "schema must be present as a string";
        }
        if (!(typeof table == 'string') || table.length < 1) {
          msg[''+idx]['table'] = "table must be present as a string";
        }
        if (!(typeof where == 'string') || Utils.escapeString(where).length < 1) {
          msg[''+idx]['where'] = "where must be present as a string";
        }
        if (!(typeof record == 'object') || Object.keys(record).length < 1) {
          msg[''+idx]['record'] = "record must be present as key value pairs";
        }
        if (!(typeof bind_params == 'object')) {  // || Object.keys(bind_params).length < 1
          msg[''+idx]['record'] = "bind must be present as key value pairs";
        }
        // data validation
        // if (!(table in Object.keys(rules))) {
        //   rules[table] = await Validate.getTableRules(table, schema);
        // }
        // if (isObject(rules[table]) && Object.keys(rules[table]).length > 0) {
        vmsg[''+idx] = await Validate.check([record], table);  // rules[table]
        if (Utils.isObject(vmsg[''+idx]) && Object.keys(vmsg[''+idx]).length > 0) {
          msg[''+idx]['validations'] = vmsg[''+idx][0];
          delete vmsg[''+idx];
        }
        // }
        if (!msg[''+idx] || Object.keys(msg[''+idx]).length < 1) {
          try {
            schemaTable = (typeof schema == 'string' && schema.length > 0)? Sequelize.TableNameWithSchema(table, schema, '.') : table;
            data = await DbAccess.updateData(schemaTable, record, where, bind_params);
            delete msg[''+idx];
          } catch(err) {
            msg[''+idx]['error'] = err.message;
          }
        }
        idx = idx + 1;
      }
      if (Object.keys(msg).length < 1) {
        return Utils.sendResponse(res, data);
      }
    }
    if (Object.keys(msg).length > 0) {
      let err = {};
      err['status'] = 400;
      err['msg'] = msg;
      return errorHandler(err, req, res, next);
    }
    return Utils.sendResponse(res, data, 400, {"error":"Data Error"});
  };

  /**
   * Remove api.
   * Sample input json: {
   *   "objects":[{
   *     "table": "zones",
   *     "where": "zone_id IN ('136', '137')",
   *     "bind": {"zone_id": [158, 159]}
   *   },{
   *     "table": "zones",
   *     "where": "zone_id IN ('138', '139')"
   *   }]
   * }
   * @param {*} req request object
   * @param {*} res response object
   * @param {*} next callback
   * @returns JSON object
   */
  static remove = async function(req, res, next) {
    let objects = req.body.objects? req.body.objects: [];
    let msg = {};
    let data = [];
    let idx = 0;
    if (!Array.isArray(objects)) {
      msg['0'] = {};
      msg['0']['objects'] = "objects must be an array";
    }
    if (objects.length > 0) {
      for (const obj in objects) {
        msg[''+idx] = {};
        let table = (objects[obj]['table'])? objects[obj]['table'] : '';
        let where = (objects[obj]['where'])? objects[obj]['where'] : '';
        let bind_params = (objects[obj]['bind'])? objects[obj]['bind']: {};
        if (!(typeof table == 'string') || table.length < 1) {
          msg[''+idx]['table'] = "table must be present as a string";
        }
        if (!(typeof where == 'string') || Utils.escapeString(where).length < 1) {
          msg[''+idx]['where'] = "where must be present as a string";
        }
        if (!(typeof bind_params == 'object')) {
          msg[''+idx]['record'] = "bind must be present as key value pairs";
        }
        if (!msg[''+idx] || Object.keys(msg[''+idx]).length < 1) {
          try {
            data = await DbAccess.deleteData(table, where, bind_params);
            delete msg[''+idx];
          } catch(err) {
            msg[''+idx]['error'] = err.message;
          }
        }
      }
      if (Object.keys(msg).length < 1) {
        return Utils.sendResponse(res, []);
      }
    }
    if (Object.keys(msg).length > 0) {
      let err = {};
      err['status'] = 400;
      err['msg'] = msg;
      return errorHandler(err, req, res, next);
    }
    return Utils.sendResponse(res, data, 400, {"error":"Data Error"}, data);
  };

}

exports.Service = Service;
