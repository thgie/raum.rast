// couch.js is the basic wrapper for couchdb requests

var http   = require('http');
var config = require('../config');

var uuid = function(callback){
  get('/_uuids', callback);
}

var get = function(what, callback){
  
  var req = http.request({
    auth: config.couch.admin+':'+config.couch.password,
    host: config.couch.host,
    path: what,
    port: config.couch.port,
    method: 'GET'
  }, function(res){

    var result = '';

    res.on('data', function (chunk) {
      result += chunk;
    });
    res.on('end', function(){
      callback(JSON.parse(result));
    });

  }).end();

}

var put = function(what, data, callback){

  var req = http.request({
    auth: config.couch.admin+':'+config.couch.password,
    host: config.couch.host,
    path: what,
    port: config.couch.port,
    method: 'PUT'
  }, function(res){

    var result = '';

    res.on('data', function (chunk) {
      result += chunk;
    });
    res.on('end', function(){
      callback(JSON.parse(result));
    });

  });

  req.write(JSON.stringify(data));
  req.end();

}

module.exports = {
  get: get,
  put: put,
  uuid: uuid
}