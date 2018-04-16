$(document).ready(function(){

  // init

  raum.lib.init();

  raum.ui.init({
    wrapper: $('.map')[0],
    lat: 46.947922,
    lng: 7.444609,
    locs: raeume
  });

  // ui

  if($.cookie('authenticated')){
    $('.user-form').hide();
    $('.options-menu').show();
  } else {
    $('.user-form').show();
  }

  $('.new-raum-modal').on('hide', function () {
    reset_process();
  });

  $('.comment-modal').on('hide', function () {
    reset_process();
  });

  function reset_process(){
    $('.address').val('');
    $('.contact').val('');
    $('.comment').val('');
    $('.from').val('');
    $('.until').val('');
    $('.thumbs').empty();

    $('.add-raum').attr('disabled', 'disabled');

    $('.new-raum-process > div').hide();
  }

  function reset_comment(){
    $('.comment-process > div').hide();
  }

  // change map size
  change_map_size($.cookie('map-size'));

  $('.toggle-map-size').click(function(e){
    e.preventDefault();

    var map_height = $('.map').height() / $('.map').parent().height() * 100;

    if(map_height > 55){
      change_map_size('normal');
    }
    if(map_height < 65){
      change_map_size('large');
    }
  });

  function change_map_size(size){
    if(size === 'normal'){
      $('.toggle-map-size').removeClass('fui-cross-inverted').addClass('fui-plus-inverted');
      $('.map').animate({'height': '50%'}, 150, function(){
        raum.ui.map.resize();
      });
      $.cookie('map-size', 'normal');
    }
    if(size === 'large'){
      $('.toggle-map-size').removeClass('fui-plus-inverted').addClass('fui-cross-inverted');
      $('.map').animate({'height': $(window).height() - 70 + 'px'}, 150, function(){
        raum.ui.map.resize();
      });
      $.cookie('map-size', 'large');
    }
  }

  // add new location process

  // init
  $('.new-raum-btn').click(function(){

    $('.new-raum-modal button').show();
    $('.new-raum-modal .modal-close-btn').hide();

    if(navigator.geolocation){
      $('.new-raum-step-one').show();
    } else {
      $('.new-raum-step-two').show();
    }

    $('.new-raum-modal').modal('show');
  });

  // step one
  $('.new-raum-onsite-yes').click(function(){
    raum.lib.position.get(function(res){
      if(res.error === 'not_found') {
        raum.ui.message.POSITION_NOT_FOUND();
        raum.ui.fade_lmnts('.new-raum-step-one', '.new-raum-step-two');
      } else {
        $('.temp_lat').val(res.lat);
        $('.temp_lng').val(res.lng);
        raum.lib.geocode.latlng(res.lat, res.lng, function(res){
          if(res.error === 'not_found') {
            raum.ui.message.POSITION_NOT_FOUND();
            raum.ui.fade_lmnts('.new-raum-step-one', '.new-raum-step-two');
          } else {
            $('.address').val(res.response);
            $('.add-raum').removeAttr('disabled');
            raum.ui.fade_lmnts('.new-raum-step-one', '.new-raum-step-three');
          }
        });
      }
    });
  });

  $('.new-raum-onsite-no').click(function(){
    raum.ui.fade_lmnts('.new-raum-step-one', '.new-raum-step-two');
  });

  // step two
  $('.address-search-btn').click(function(){
    search_address();
  });

  $('.address-search').keypress(function(e){
    if ( event.which == 13 ) {
     search_address();
    }
  });

  var search_address = function(){
    raum.lib.geocode.address($('.address-search').val(), function(res){
      if(res.error === 'not_found'){
        raum.ui.message.ADDRESS_NOT_FOUND();
        $('.address-search').focus();
      } else {
        $('.temp_lat').val(res.lat);
        $('.temp_lng').val(res.lng);
        $('.address').val($('.address-search').val());
        $('.add-raum').removeAttr('disabled');
        raum.ui.fade_lmnts('.new-raum-step-two', '.new-raum-step-three');
      }
    });
  }

  // step three
  $('.add-raum').click(function(){

    var images = [];

    for(var i = 0; i < $('.thumb img').length; i++){
      images.push($($('.thumb img')[i]).attr('data-id'));
    }

    var loc = {
      'images': images,
      'address': $('.address').val(),
      'lat': $('.temp_lat').val(),
      'lang': $('.temp_lng').val(),
      'contact': $('.contact').val(),
      'comment': $('.comment').val(),
      'from': $('.from').val(),
      'until': $('.until').val(),
      'user': $.cookie('email')
    }

    raum.lib.loc.add(loc, function(){
      $('.new-raum-modal button').hide();
      $('.new-raum-modal .modal-close-btn').show();
      raum.ui.fade_lmnts('.new-raum-step-three', '.new-raum-step-four');
    });
  });

  // add comment to location

  $('.comment-btn').click(function(){
    if($('.comment-field').val() === ''){
      $('.comment-field').focus();
      raum.ui.message.show('Bitte Kommentar schreiben oder abbrechen.');
      return;
    }

    raum.lib.loc.comment($('.comment-for').val());

    $('.comment-field').val('');
    $('.comment-modal button').hide();
    $('.comment-modal .close-btn').show();
    raum.ui.fade_lmnts('.comment-step-one', '.comment-step-two');
  });

  // user login & register

  // login process
  $('.login').click(function(e){

    e.preventDefault();

    if($('.email').val() === ''){
      $('.email').focus();
      raum.ui.message.USERNAME_FILL();

      return;
    }
    if($('.password').val() === ''){
      $('.password').focus();
      raum.ui.message.PASSWORD_FILL();

      return;
    }

    raum.lib.user.login(
      $('.email').val(),
      $('.password').val(),
      function(res){
        if(res.response === 'success'){
          raum.ui.fade_lmnts('.user-form', '.options-menu');
          $.cookie('authenticated', 'true', { expires: 7 });
          $.cookie('email', res.email, { expires: 7 });
          raum.ui.message.show('Erfolgreich eingeloggt.');
        }

        if(res.error === 'not_found'){
          $('.email').empty().focus();
          raum.ui.message.USERNAME_WRONG();
        }

        if(res.error === 'wrong_password'){
          $('.password').empty().focus();
          raum.ui.message.PASSWORD_WRONG();
        }
      }
    );
  });

  // register process
  $('.register').click(function(e){

    e.preventDefault();

    if($('.email').val() === ''){
      $('.email').focus();
      raum.ui.message.USERNAME_FILL();

      return;
    }
    if($('.password').val() === ''){
      $('.password').focus();
      raum.ui.message.PASSWORD_FILL();

      return;
    }

    raum.lib.user.register(
      $('.email').val(),
      $('.password').val(),
      function(res){
        if(res.response === 'success'){
          raum.ui.fade_lmnts('.user-form', '.options-menu');
          $.cookie('authenticated', 'true', { expires: 7 });
          $.cookie('email', res.email, { expires: 7 });
          raum.ui.message.show('Erfolgreich angemeldet.');
        }

        if(res.error === 'already_exists'){
          $('.email').empty().focus();
          raum.ui.message.show('Benutzername schon vorhanden.');
        }
      }
    );
  });

  // logout process
  $('.logout').click(function(e){
    $.removeCookie('authenticated');
    $.removeCookie('email');
    $('.options-menu').fadeOut('fast', function(){
      $('.user-form').fadeIn('fast')
      raum.ui.message.show('Komm bald wieder :(');
    });
  });

})