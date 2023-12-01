
const { CommonUtils } = require('../utils/common_utils');
const { DbAccess } = require('../db/db_access');
const { Validations } = require('./validations');

class Validate {

  static rules = {};

  static getTableRules = async (table, schema='') => {
    if (table in Validate.rules && CommonUtils.isObject(Validate.rules[table])) {
      return Validate.rules[table];
    }
    let comments = await DbAccess.columnComments(table, schema);
    Validate.rules[table] = {};
    let v = {};
    if (Array.isArray(comments) && comments.length > 0) {
      for (const rec of comments) {
        v = {};
        try {
          v = (rec['column_comment'].length > 0)? JSON.parse(rec['column_comment']) : v;
        } catch (e) {
          // no validations
        }
        if ('validations' in v) {
          Validate.rules[table][rec['column_name']] = v['validations'];
        }
      }
    }
    return Validate.rules[table];
  };

  static check = async (data, table, schema, checks={}) => {
    let msg = {};
    let idx = 0;
    if (typeof table == 'string' && table.length > 0) {
      if (table in Validate.rules && CommonUtils.isObject(Validate.rules[table])) {
        checks = Validate.rules[table];
      } else {
        checks = await Validate.getTableRules(table, schema);
      }
    }
    if (typeof data == 'object' && Object.keys(data).length > 0
      && typeof checks == 'object' && Object.keys(checks).length > 0
    ) {
      for (const rec of data) {
        msg[''+idx] = {};
        if (CommonUtils.isObject(rec) && Object.keys(rec).length > 0) {
          for (const key of Object.keys(rec)) {
            msg[''+idx][key] = {};
            if (key in checks && CommonUtils.isObject(checks[key]) && Object.keys(checks[key]).length > 0) {
              for (const check of Object.keys(checks[key])) {
                msg[''+idx][key][check] = await Validations[check].checkValidation(schema, table, key, rec[key], checks[key][check]);
                if (Object.keys(msg[''+idx][key][check]).length < 1) {
                  delete msg[''+idx][key][check];
                }
              }
            }
            if (Object.keys(msg[''+idx][key]).length < 1) {
              delete msg[''+idx][key];
            }
          }
        }
        if (Object.keys(msg[''+idx]).length < 1) {
          delete msg[''+idx];
        }
        idx = idx + 1;
      }
    }
    return msg;
  };

}

exports.Validate = Validate;
