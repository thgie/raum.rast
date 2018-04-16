// images.js is responsible for image uploads and retrieving

var fs     = require('fs');
var config = require('../config');
var Flickr = require('flickr-with-uploads').Flickr;
var client = new Flickr(config.twitter.key, config.twitter.secret,
                    config.twitter.oauth.token, config.twitter.oauth.secret);

var test = function(){
  client.createRequest('flickr.panda.getList', {}, true, function(err, res){
    console.log(res);
  }).send();
}

var upload = function(image, callback){
  var params = {
    is_public: 0, hidden: 2,
    photo: fs.createReadStream(image, {flags: 'r'})
  };
  api('upload', params, function(err, res) {
    if (err) {
      console.error("Could not upload photo:", err.toString());
    }
    get_photo_url(res.photoid, 'Square', callback);
  });
}

var get_photo_url = function(id, size, callback){
  var params = {
    photo_id: id
  };
  api('flickr.photos.getSizes', params, function(err, res){
    var image = {
      'id': id
    }
    for(var s in res.sizes.size){
      if(res.sizes.size[s].label === size){
        image['size'] = res.sizes.size[s].source;
      }
      if(res.sizes.size[s].label === 'Square'){
        image['thumb'] = res.sizes.size[s].source;
      }
    }
    callback(image);
  });
}

var get_photos = function(ids, size, callback){
  var images = [];

  for(var i in ids){
    get_photo_url(ids[i], size, function(res){
      images.push(res);
      if(images.length === ids.length){
        callback(images);
      }
    });
  }
}

function api(method_name, data, callback) {
  return client.createRequest(method_name, data, true, callback).send();
}

module.exports = {
  test: test,
  upload: upload,
  get_photo_url: get_photo_url,
  get_photos: get_photos
}