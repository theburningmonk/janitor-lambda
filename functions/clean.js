'use strict';

const co    = require('co');
const clean = require('./lib').clean;

module.exports.handler = co.wrap(function* (event, context, callback) {
  console.log(JSON.stringify(event));

  yield clean();

  callback(null, "ok");
});