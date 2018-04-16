// raeume.js is here to retrieve and save locations

var http  = require('http');
var couch = require('./couch');

var all = function(callback){

  var raeume_consolidated = [];

  couch.get('/raeume/_all_docs?include_docs=true', function(raeume){

    // callback(raeume);

    var i = 0;
    var l = raeume.rows.length;

    for(var r in raeume.rows){
      raeume.rows[r].doc.user = raeume.rows[r].doc.user.split('@')[0] + '@…';
      raeume_consolidated.push(raeume.rows[r].doc);
      i++;
      if(i == l){
        callback(raeume_consolidated);
      }
    }
  });
}

var one = function(id, callback){
  couch.get('/raeume/'+id, function(raum){
    callback(raum);
  });
}

var register = function(data, callback){
  couch.uuid(function(res){
    couch.put('/raeume/'+res.uuids[0], data, function(res){
      callback(res, data);
    });
  });
}

var update = function(data, callback){
  couch.uuid(function(res){
    couch.put('/raeume/'+data._id, data, function(res){
      callback(res);
    });
  });
}

module.exports = {
  all: all,
  one: one,
  register: register,
  update: update
}