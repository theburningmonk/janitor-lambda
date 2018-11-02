'use strict';

const _      = require('lodash');
const AWS    = require('aws-sdk');
const lambda = new AWS.Lambda();

let functions = [];

let listFunctions = async () => {
  console.log('listing all available functions');

  let loop = async (marker, acc) => {
    let params = {
      Marker: marker,
      MaxItems: 10
    };

    let res = await lambda.listFunctions(params).promise();
    let functions = res.Functions.map(x => x.FunctionArn);
    let newAcc = acc.concat(functions);

    if (res.NextMarker) {
      return await loop(res.NextMarker, newAcc);
    } else {
      return newAcc.sort(() => Math.random() - Math.random()); // Shuffle newAcc array
    }
  };

  return await loop(undefined, []);
};

let listVersions = async (funcArn) => {
  console.log(`listing versions for function : ${funcArn}`);

  let loop = async (marker, acc) => {
    let params = {
      FunctionName: funcArn,
      Marker: marker,
      MaxItems: 20
    };

    let res = await lambda.listVersionsByFunction(params).promise();
    let versions = res.Versions.map(x => x.Version).filter(x => x != "$LATEST");
    let newAcc = acc.concat(versions);

    if (res.NextMarker) {
      return loop(res.NextMarker, newAcc);
    } else {
      return newAcc;
    }
  };

  return loop(undefined, []);
};

let listAliasedVersions = async (funcArn) => {
  console.log(`listing aliases for function : ${funcArn}`);

  let loop = async (marker, acc) => {
    let params = {
      FunctionName: funcArn,
      Marker: marker,
      MaxItems: 20
    };

    let res = await lambda.listAliases(params).promise();
    let versions = res.Aliases.map(x => x.FunctionVersion);
    let newAcc = acc.concat(versions);

    if (res.NextMarker) {
      return loop(res.NextMarker, newAcc);
    } else {
      return newAcc;
    }
  };

  return loop(undefined, []);
};

let deleteVersion = async (funcArn, version) => {
  console.log(`deleting [${funcArn}] version [${version}]`);

  let params = {
    FunctionName: funcArn,
    Qualifier: version
  };

  await lambda.deleteFunction(params).promise();
};

let cleanFunc = async (funcArn) => {
  console.log(`cleaning function: ${funcArn}`);
  let aliasedVersions = await listAliasedVersions(funcArn);
  console.log('found aliased versions:\n', aliasedVersions);

  let versions = await listVersions(funcArn);
  console.log('found versions:\n', versions);

  for (let version of versions) {
    if (!_.includes(aliasedVersions, version)) {
      await deleteVersion(funcArn, version);
    }
  }
};

let clean = async () => {
  if (functions.length === 0) {
    functions = await listFunctions();
  }

  // clone the functions that are left to do so that as we iterate with it we
  // can remove cleaned functions from 'functions'
  let toClean = functions.map(x => x);
  console.log(`${toClean.length} functions to clean:\n`, toClean);

  for (let func of toClean) {
    await cleanFunc(func);
    _.pull(functions, func);
  }
};

module.exports.clean = clean;