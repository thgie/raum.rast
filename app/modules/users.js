// users.js is your user managment module

var http      = require('http');
var crypto    = require('crypto');
var couch     = require('./couch');
var config    = require('../config');
var key       = config.secret_key;

var login = function(data, callback){
  couch.get('/users/'+data.email, function(res){
    if(res.error === 'not_found'){
      callback(res);
    } else {

      var password = res.password;
      var decipher = crypto.createDecipher('aes-256-cbc', key);

      decipher.update(password, 'base64', 'utf8');
      var decrypted_password = decipher.final('utf8');
      
      if(data.password === decrypted_password){
        callback({
          'email': res.email,
          'response': 'success'
        });
      } else {
        callback({
          'error': 'wrong_password'
        });
      }
    }
  });
}

var register = function(data, callback){

  couch.get('/users/'+data.email, function(res){
    if(res.error === 'not_found'){

      var password = data.password;
      var cipher = crypto.createCipher('aes-256-cbc', key);

      cipher.update(password, 'utf8', 'base64');
      var encrypted_password = cipher.final('base64');

      data.password = encrypted_password;

      couch.put('/users/'+data.email, data, function(){
        callback({
          'email': res.email,
          'response': 'success'
        });
      });
    } else {
      callback({
        'error': 'already_exists'
      });
    }
  });

}

module.exports = {
  login: login,
  register: register
}