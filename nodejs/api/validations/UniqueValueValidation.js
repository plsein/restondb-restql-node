
class UniqueValueValidation {

  static checkValidation = async function(schema, table, field, data, rule) {
    let valid = true;
    // your implementation in here
    if (valid)  {
      return {};
    }
    return {"valid": false, "msg": rule['msg']};
  };

}

exports.UniqueValueValidation = UniqueValueValidation;
