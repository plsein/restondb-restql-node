
const { postgraphile, makePluginHook } = require("postgraphile");
const PgSimplifyInflectorPlugin = require("@graphile-contrib/pg-simplify-inflector");
const PostGraphileDerivedFieldPlugin = require("postgraphile-plugin-derived-field");
const PgManyToManyPlugin = require("@graphile-contrib/pg-many-to-many");
const PgAggregatesPlugin = require("@graphile/pg-aggregates").default;
const { PgMutationUpsertPlugin } = require("postgraphile-upsert-plugin");
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");
const PostGraphileFulltextFilterPlugin = require('postgraphile-plugin-fulltext-filter');
const { default: OperationHooks } = require("@graphile/operation-hooks");
const { default: PgPubsub } = require("@graphile/pg-pubsub");
const { default: PostgraphilePluginApolloFederation } = require("@brooklyn-labs/postgraphile-plugin-apollo-federation");
const { default: PostGraphileManyCUDPlugin } = require("postgraphile-plugin-many-create-update-delete");
// const PostGraphileConnectionMultiTenantPlugin = require("postgraphile-plugin-connection-multi-tenant");
const { DateTruncAggregateGroupSpecsPlugin } = require("./pgraphile_plugins");
const { Config } = require('../configs/config');
const { createRequire } = require("module");

//const require = createRequire(import.meta.url);
// global.require = require;

/**
 * Postgraphile plugin hooks
 */
const pluginHook = makePluginHook([OperationHooks, PgPubsub]);

/**
 * Postgraphile configuration options
 */
exports.postgraphileOptions = {
  watchPg: true,
  graphiql: true,
  enhanceGraphiql: true,
  subscriptions: true,
  retryOnInitFail: true,
  dynamicJson: true,
  setofFunctionsContainNulls: false,
  // pgDefaultRole: "public",
  ignoreRBAC: false,
  showErrorStack: "json",
  extendedErrors: [
    "severity",
    "code",
    "detail",
    "hint",
    "position",
    "internalPosition",
    "internalQuery",
    "where",
    "schema",
    "table",
    "column",
    "dataType",
    "constraint",
    "file",
    "line",
    "routine"
  ],
  pluginHook,
  appendPlugins: [
    PgSimplifyInflectorPlugin,
    PostGraphileDerivedFieldPlugin,
    PgManyToManyPlugin,
    ConnectionFilterPlugin,
    PgAggregatesPlugin,
    PgMutationUpsertPlugin,
    PostGraphileFulltextFilterPlugin,
    PostGraphileManyCUDPlugin,
    PostgraphilePluginApolloFederation,
    DateTruncAggregateGroupSpecsPlugin
    // PostGraphileConnectionMultiTenantPlugin
  ],
  exportGqlSchemaPath: "schema.graphql",
  exportJsonSchemaPath: "schema.json",
  graphiql: true,
  enhanceGraphiql: true,
  allowExplain(req) {
    // TODO: customise condition!
    return true;
  },
  enableQueryBatching: true,
  // pgSettings: async req => ({
    // 'user.id': `${req.session.passport.user}`,
    // 'jwt.claims.user_id': `${req.user.id}`,
    // 'http.headers.x-something': `${req.headers['x-something']}`,
    // 'http.method': `${req.method}`,
    // 'http.url': `${req.url}`,
  // }),
  pgSettings: req => {
    const settings = {
      // 'role': 'public',
      'http.method': `${req.method}`,
      'http.url': `${req.url}`,
      'statement_timeout': 3000
    };
    if (req.user) {
      settings["user.permissions"] = req.user.scopes;
    }
    return settings;
  },
  async additionalGraphQLContextFromRequest(req, res) {
    // You can perform asynchronous actions here if you need to; for example
    // looking up the current user in the database.

    // Return here things that your resolvers need
    return {
      // Return the current user from Passport.js or similar
      user: req.user,
      // Add a helper to get a header
      getHeader(name) {
        return req.get(name);
      },
      // Give access to the database-owner PostgreSQL pool, for example to
      // perform privileged actions
      // rootPgPool,
    };
  },
  jwtVerifyOptions: {
    audience: null
  },
  jwtSecret: Config['JWT_AUTH_SECRET'],
  // jwtPgTypeIdentifier: 'schema-name.jwt_token',
  graphileBuildOptions:{
    connectionFilterArrays: true,
    connectionFilterComputedColumns: true,
    connectionFilterRelations: true,
    connectionFilterSetofFunctions: true,
    connectionFilterLogicalOperators: true,
    connectionFilterAllowNullInput: true,
    connectionFilterAllowEmptyObjectInput: true,
    connectionFilterUseListInflectors: true,
    // tenantColumnName: 'tenantId',
    derivedFieldDefinitions: [
      // derived field definitions here
    ]
  },
  legacyRelations: "omit"
};
