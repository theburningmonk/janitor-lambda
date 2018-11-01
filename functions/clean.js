'use strict';

const clean = require('./lib').clean;

module.exports.handler = async (event, context, callback) => {
  console.log(JSON.stringify(event));

  await clean();

  callback(null, "ok");
};