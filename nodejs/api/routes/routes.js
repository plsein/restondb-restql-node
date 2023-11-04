
const { Auth } = require('../auth/auth');
const { Utils } = require('../utils/utils');
const { Service } = require('../services/service');

class Routes {

  static setRoutes = function(app) {

    /**
     * Root path handler
    */
    app.get('/', function (req, res, next) {
      return Utils.sendResponse(res, 'Hi !');
    });
  
    /**
     * Get auth token
     */
    app.post("/token", Auth.getToken);
  
    /**
     * Get GraphQL Schema
     */
    app.get('/graph-schema', function (req, res, next) {
      return Utils.sendResponse(res, Utils.readFile('schema.json'));
    });
  
    /**
     * Fetch data api
     */
    app.post("/api/select", async function (req, res, next) {
      return await Service.select(req, res, next);
    });
  
    /**
     * Add data api
     */
    app.post("/api/add", async function (req, res, next) {
      return await Service.add(req, res, next);
    });
  
    /**
     * Edit data api
     */
    app.post("/api/edit", async function (req, res, next) {
      return await Service.edit(req, res, next);
    });
  
    /**
     * Remove data api
     */
    app.post("/api/remove", async function (req, res, next) {
      return await Service.remove(req, res, next);
    });
  
  };

}

exports.Routes = Routes;
