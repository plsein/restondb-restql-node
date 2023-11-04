
/**
 * Imports
 */
const fs = require('fs');

class Utils {

  /**
   * Determine whether the given `value` is an object.
   * @param value object
   * @returns boolean
   */
  static isObject = function(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  };

  /**
   * Read a file
   * @param filePath String file path
   */
  static readFile = function(filePath) {
    return fs.readFileSync(filePath, 'utf8');
  };

  /**
   * Send Response
   * @param res response object
   * @param output output object
   */
  static sendResponse = function(res, output, code=200, msg={"status":"ok"}, isJSON=true) {
    if(isJSON) {
      return res.json({"code":code, "msg":msg, "data":output});
    }
    return res.send(output);
  };

  /**
   * Write application Log
   * @param req request object
   */
  static reqLog = function(req, msg) {
    req.log.info(msg);
  };

  /**
   * Write application Log
   * @param req request object
   */
  static stringOccurance = function(text) {
    let regex = new RegExp("'", "gi");
    let count = (text.match(regex) || []).length;
    return count;
  };

  /**
   * Escape string
   * @param text string
   * return string
   */
  static escapeString = function(text) {
    // Uncomment after proper testing
    // const regex_slash = {"search": /[\\]/g, "replace": "\\\\"};
    // Avoid sql comment
    // This will fail sql query if comment is not quoted and thus prevent sql injection
    const regex_hyphen = {"search": new RegExp("--", 'g'), "replace": "- - "};
    // Yet another avoid sql comment
    // This will fail sql query if comment is not quoted and thus prevent sql injection
    const regex_hyphen_ya = {"search": new RegExp("--", 'g'), "replace": "&minus;&minus;"};
    // Avoid multiple sql statements at once
    // This will fail sql query if semicolon is not quoted and thus prevent sql injection
    const regex_semicolon = {"search": new RegExp(";", 'g'), "replace": "&#59;"};
    let regex_list = [regex_semicolon, regex_hyphen, regex_hyphen_ya];  // regex_slash
    // Avoid odd occurances of quote
    // This will fail sql query if quote is not closed properly and thus prevent sql injection
    if (Utils.stringOccurance(text) % 2 != 0) {
      const regex_quote = {"search": new RegExp("'", 'g'), "replace": "''"};
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

exports.Utils = Utils;
