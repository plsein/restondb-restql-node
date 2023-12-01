/**
 * Imports
 */
const serverless = require('serverless-http');
const express = require('express');
const { expressjwt } = require("express-jwt");  // https://github.com/MichielDeMey/express-jwt-permissions
const { postgraphile } = require("postgraphile");
const { Config } = require('./configs/config');
const { postgraphileOptions } = require('./graph/pgraphile');
const { errorHandler, initMiddleware } = require('./middlewares/middleware');
const { Routes } = require('./routes/routes');
const { appLog, reqLogger } = require('./configs/logger');

/**
 * Configure the application
 */
(async () => {

  let app = express();
  app.use(reqLogger);
  app.use([initMiddleware, express.json({ extended: true })]);
  app.use(expressjwt({secret: Config.JWT_AUTH_SECRET, algorithms: ["HS256"]}).unless({
    method: "OPTIONS", path: [
      "/token", 
      "/graphiql", 
      "/graphql/stream"
    ]})
  );
  app.use(postgraphile(Config.DB_URI, [Config.DB_SCHEMA], postgraphileOptions));
  app.use(errorHandler);
  Routes.setRoutes(app);

  /**
   * App Initialization
   */
  module.exports.handler = serverless(app);
  appLog.info("Server starting on port: " + (Config.APP_PORT || 3000));
  app.listen(Config.APP_PORT || 3000);

})();
