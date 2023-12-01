
const { Auth } = require('../auth/auth');
const { CommonUtils } = require('../utils/common_utils');
const { Service } = require('../services/service');

class Routes {

  static setRoutes = (app) => {

    /**
     * Root path handler
    */
    app.get('/', (req, res, next) => {
      return CommonUtils.sendResponse(res, 'Hi !');
    });
  
    /**
     * Get auth token
     */
    app.post("/token", Auth.getToken);
  
    /**
     * Get GraphQL Schema
     */
    app.get('/graph-schema', (req, res, next) => {
      return CommonUtils.sendResponse(res, CommonUtils.readFile('schema.json'));
    });
  
    /**
     * Fetch data api
     */
    app.post("/api/select", async (req, res, next) => {
      return await Service.select(req, res, next);
    });
  
    /**
     * Add data api
     */
    app.post("/api/add", async (req, res, next) => {
      return await Service.add(req, res, next);
    });
  
    /**
     * Edit data api
     */
    app.post("/api/edit", async (req, res, next) => {
      return await Service.edit(req, res, next);
    });
  
    /**
     * Remove data api
     */
    app.post("/api/remove", async (req, res, next) => {
      return await Service.remove(req, res, next);
    });
  
  };

}

exports.Routes = Routes;
