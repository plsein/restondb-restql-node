let Validations = {}

require("fs").readdirSync(__dirname).forEach(function(file) {
  if (file != 'validations.js' && file != '.' && file != '..' && file != 'index.js' && file != 'validate.js') {
    let validation_name = file.substring(0, file.indexOf('.'));
    let validation = require("./" + file);
    Validations[validation_name] = validation[validation_name];
  }
});

module.exports.Validations = Validations;
