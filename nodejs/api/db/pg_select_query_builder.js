// const { util } = require('util');
const { SelectQueryBuilder } = require('./select_query_builder');

// let pg_select_query_builder = {
//   __proto__: select_query_builder,
// }
// util.inherits(pg_select_query_builder, select_query_builder);
// Override if required
// pg_select_query_builder.prototype.yourFunction = function () { /* ... */ };

class PGSelectQueryBuilder extends SelectQueryBuilder {

}

exports.PGSelectQueryBuilder = PGSelectQueryBuilder;
