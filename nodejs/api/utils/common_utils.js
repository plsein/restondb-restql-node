
/**
 * Imports
 */
const fs = require('fs');
const { appLog } = require('../configs/logger');

class CommonUtils {

  /**
   * Determine whether the given `value` is an object.
   * @param value object
   * @returns boolean
   */
  static isObject = (value) => {
    return Object.prototype.toString.call(value) === '[object Object]';
  };

  /**
   * Read a file
   * @param filePath String file path
   */
  static readFile = (filePath) => {
    return fs.readFileSync(filePath, 'utf8');
  };

  /**
   * Send Response
   * @param res response object
   * @param output output object
   */
  static sendResponse = (res, output, code=200, msg={"status":"ok"}, isJSON=true) => {
    if(isJSON) {
      return res.json({"code":code, "msg":msg, "data":output});
    }
    return res.send(output);
  };

  /**
   * Write application Log
   * @param req request object
   */
  static reqLog = (req, msg) => {
    req.log.info(msg);
    appLog.info(msg);
  };

  /**
   * Write application Log
   * @param req request object
   */
  static stringOccurance = (text) => {
    let regex = /'/gi;
    let count = (text.match(regex) || []).length;
    return count;
  };

  /**
   * Escape string
   * @param text string
   * return string
   */
  static escapeString = (text) => {
    // Uncomment after proper testing
    // const regex_slash = {"search": /[\\]/g, "replace": "\\\\"};
    // Avoid sql comment
    // This will fail sql query if comment is not quoted and thus prevent sql injection
    const regex_hyphen = {"search": /--/g, "replace": "- - "};
    // Yet another avoid sql comment
    // This will fail sql query if comment is not quoted and thus prevent sql injection
    const regex_hyphen_ya = {"search": /--/g, "replace": "&minus;&minus;"};
    // Avoid multiple sql statements at once
    // This will fail sql query if semicolon is not quoted and thus prevent sql injection
    const regex_semicolon = {"search": /;/g, "replace": "&#59;"};
    let regex_list = [regex_semicolon, regex_hyphen, regex_hyphen_ya];  // regex_slash
    // Avoid odd occurances of quote
    // This will fail sql query if quote is not closed properly and thus prevent sql injection
    if (CommonUtils.stringOccurance(text) % 2 != 0) {
      const regex_quote = {"search": /'/g, "replace": "''"};
      regex_list.push(regex_quote);
    }
    // Replace bad characters
    // This will fail sql query if bad characters not at wrong place otherwise the query will execute safely
    for (const regex_replace in regex_list) {
      text = text.replace(regex_replace["search"], regex_replace["replace"]);
    }
    return text.trim();
  };

}

exports.CommonUtils = CommonUtils;
