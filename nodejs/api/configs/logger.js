// const fs = require('fs');
const rfs = require("rotating-file-stream");
const pino = require('pino');
const pretty = require('pino-pretty');
const { Config } = require('./config');

// const info_stream = fs.createWriteStream(Config['LOG_DIR']+'/info.stream.out');
const streams = [
  {level: 'info', stream: rfs.createStream(Config['LOG_DIR']+'/info.log', {size: "1M", interval: "1d", compress: "gzip"})},
  {stream: pretty() },
  {level: 'debug', stream: rfs.createStream(Config['LOG_DIR']+'/debug.log', {size: "1M", interval: "1d", compress: "gzip"})},
  {level: 'fatal', stream: rfs.createStream(Config['LOG_DIR']+'/error.log', {size: "1M", interval: "1d", compress: "gzip"})}
];

const appLog = pino({
  level: 'debug' // this MUST be set at the lowest level of the destinations
}, pino.multistream(streams));

appLog.debug('this will be written to debug.stream.out');
appLog.info('this will be written to debug.stream.out and info.stream.out');
appLog.fatal('this will be written to debug.stream.out, info.stream.out and fatal.stream.out');

/**
 * Reference: https://github.com/pinojs/pino-http
 */
const reqLogger = require('pino-http')({
  logger: appLog,
  autoLogging: true,
  redact: ["req.headers.authorization"]
});

exports.appLog = appLog;
exports.reqLogger = reqLogger;
