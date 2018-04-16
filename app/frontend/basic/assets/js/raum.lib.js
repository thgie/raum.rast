var raum = {};

raum.lib = (function(){

  var _SOCKET;

  var loc_find = function(id){
    var loc;
    for(var r in raeume){
      if(raeume[r]._id === id){
        loc = raeume[r];
        break;
      }
    }
    return loc;
  }

  var repl_rev = function(loc){
    for(var r in raeume){
      if(raeume[r]._id === loc.id){
        raeume[r]._rev = loc.rev;
        break;
      }
    }
  }

  var geocode_latlng = function(lat, lng, callback){
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'location': new google.maps.LatLng(lat, lng)},
      function(results, status) { 
        if (status == google.maps.GeocoderStatus.OK) { 
          callback({'response': results[0].formatted_address});
        } else {
          callback({'error': 'not_found'}); 
        } 
    });
  }

  var geocode_address = function(address, callback){
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      {'address': address}, 
      function(results, status) { 
        if (status == google.maps.GeocoderStatus.OK) { 
          var loc = results[0].geometry.location;
          callback({'lat': loc.lat(), 'lng': loc.lng()});
        } 
        else {
          callback({'error': 'not_found'}); 
        } 
    });
  }

  var position_get = function(callback){
    navigator.geolocation.getCurrentPosition(function(position){
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    }, function(){
      callback({
        error: 'not_found'
      })
    }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
  }

  var loc_add = function(loc, callback){
    _SOCKET.emit('raum', loc);

    _SOCKET.on('raum', function(res){
      if(res.ok){
        callback();
        raum.ui.marker.add(loc);
      }
    });
  }

  var loc_gallery = function(ids, callback){
    _SOCKET.emit('images', {
      'ids': ids
    });

    _SOCKET.on('images', function(res){
      callback(res);
    });
  }

  var loc_comment = function(id, callback){
    var loc = loc_find(id);

    if(!loc.comments){
      loc.comments = [];
    }

    loc.comments.push({
      date: Date(),
      comment: $('.comment-field').val()
    });

    _SOCKET.emit('comment', loc);

    _SOCKET.on('comment', function(res){
      repl_rev(res);
    });
  }

  var user_register = function(user, password, callback){
    _SOCKET.emit('register', {
      email: user,
      password: password
    });

    _SOCKET.on('register', function(res){
      callback(res);
    });
  }

  var user_login = function(user, password, callback){
    _SOCKET.emit('login', {
      email: user,
      password: password
    });

    _SOCKET.on('login', function(res){
      callback(res);
    });
  }

  return {

    init: function(){
      _SOCKET = io.connect();

    },

    // map functions

    geocode: {
      address: function(address, callback){
        geocode_address(address, callback);
      },
      latlng: function(lat, lng, callback){
        geocode_latlng(lat, lng, callback)
      }
    },
    position: {
      get: function(callback){
        position_get(callback);
      }
    },

    // login and register

    user: {
      register: function(user, password, callback){
        user_register(user, password, callback);
      },
      login: function(user, password, callback){
        user_login(user, password, callback);
      }
    },

    // location functions

    loc: {
      add: function(loc, callback){
        loc_add(loc, callback);
      },
      comment: function(loc, callback){
        loc_comment(loc, callback);
      },
      find: function(id){
        return loc_find(id);
      },
      gallery: function(ids, callback){
        loc_gallery(ids, callback)
      }
    }
  }

})();