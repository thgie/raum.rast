/*

  raum: a node.js based geolocation manager
  Copyright (C) 2013 Adrian Demleitner

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details: http://www.gnu.org/licenses/.

*/

var fs         = require('fs');
var app        = require('http').createServer(handler);
var config     = require('./app/config');
var io         = require('socket.io').listen(app);
var formidable = require('formidable');
var zlib       = require('zlib');

var raeume     = require('./app/modules/raeume');
var users      = require('./app/modules/users');
var images     = require('./app/modules/images');

var tpls       = __dirname+'/app/frontend/'+config.theme+'/templates/';
var assets     = __dirname+'/app/frontend/'+config.theme+'/assets/';

app.listen('1337');

// config

io.enable('browser client minification');
io.enable('browser client etag');
io.enable('browser client gzip');
io.set('log level', 1);

io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
]);

// routing

function handler(req, res){

  // compression setup

  var acceptEncoding = req.headers['accept-encoding'];

  if (!acceptEncoding) {
    acceptEncoding = '';
  }

  // index

  if(req.url === '/'){
    fs.readFile(tpls+'index.html', function(err, data){
      if (err) throw err;

      data = data.toString().replace('GOOGLE-MAPS', config.googlemapsjs+config.googlemapsapikey);

      var cloudmade = 'var cloudmade = "http://b.tile.cloudmade.com/'
                    + config.cloudmade.key + '/'
                    + config.cloudmade.style + '/'
                    + '256/{z}/{x}/{y}.png?token='
                    + config.cloudmade.style + '"';

      raeume.all(function(all){
        data = data.replace('LOC - BOOTSTRAP', 'var raeume = '+JSON.stringify(all));
        data = data.replace('RAEUME-COUNT', all.length);
        data = data.replace('CM - BOOTSTRAP', cloudmade);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      });
    });
  }

  // image upload

  if(req.url === '/upload'){
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      images.upload(files.photo.path, function(image){
        fs.readFile(assets+'partial/upload.html', function(err, data){
          if (err) throw err;

          data = data.toString().replace('var replaced = false;', "parent.raum.ui.thumb.add("+JSON.stringify(image)+");");

          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end(data);
        });
      });
    });
  }

  // assets

  if(['js', 'css', 'svg', 'fonts', 'partial'].indexOf(req.url.split('/')[1]) > -1){

    var path = req.url.split('/')[1]+'/';
    var file = req.url.split('/')[2];

    if(path.indexOf('partial') > -1){
      file += '.html';
    }

    var raw = fs.createReadStream(assets+path+file);

    if (acceptEncoding.match(/\bdeflate\b/)) {
      res.writeHead(200, { 'content-encoding': 'deflate' });
      raw.pipe(zlib.createDeflate()).pipe(res);
    } else if (acceptEncoding.match(/\bgzip\b/)) {
      res.writeHead(200, { 'content-encoding': 'gzip' });
      raw.pipe(zlib.createGzip()).pipe(res);
    } else {
      res.writeHead(200, {});
      raw.pipe(res);
    }

  }

  if(['img', 'svg'].indexOf(req.url.split('/')[1]) > -1){

    var path = req.url.split('/')[1]+'/';
    var file = req.url.split('/')[2];

    if(path.indexOf('svg') > -1){
      res.writeHead(200, {'Content-Type': 'image/svg+xml'});
    }
    if(path.indexOf('img') > -1){
      if(file.indexOf('png') > -1){
        res.writeHead(200, {'Content-Type': 'image/png'});
      }
      if(file.indexOf('gif') > -1){
        res.writeHead(200, {'Content-Type': 'image/gif'});
      }
    }
    if(path.indexOf('fonts') > -1){
      res.writeHead(200, {'Content-Type': 'application/octet-stream'});
    }

    res.end(fs.readFileSync(assets+path+file));
  }

  // dynamic marker
  if(['dyn'].indexOf(req.url.split('/')[1]) > -1){

    var color = req.url.split('/')[3];

    fs.readFile(assets+'svg/tag.svg', function(err, data){
      if (err) throw err;

      data = data.toString().replace(new RegExp('COLOR', 'g'), color);

      res.writeHead(200, {'Content-Type': 'image/svg+xml'});
      res.end(data);
    });
  }

  // oh beloved favicon

  if(req.url === '/favicon.ico'){
    res.end(fs.readFileSync(assets+'/favicon.ico'));
  }

}

// socket communication

io.sockets.on('connection', function (socket) {

  socket.on('login', function(data){
    users.login(data, function(res){
      socket.emit('login', res);
    });
  });
  socket.on('register', function(data){
    users.register(data, function(res){
      socket.emit('register', res);
    });
  });

  socket.on('raum', function(data){
    data.created = new Date().getTime();
    raeume.register(data, function(res, data){
      socket.emit('raum', res);
      data._id = res.id;
      data._rev = res.rev;
      socket.broadcast.emit('new-raum', data);
    });
  });

  socket.on('images', function(data){
    images.get_photos(data.ids, 'Medium', function(res){
      socket.emit('images', res);
    });
  });

  socket.on('comment', function(data){
    raeume.update(data, function(res){
      socket.emit('comment', res);
    })
  });

});