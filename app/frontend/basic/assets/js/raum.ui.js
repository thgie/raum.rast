raum.ui = (function () {

    var _MAP;
    var _MARKER;
    var _TIMEGRID = 172800000;
    var _TEMP_MARKER;
    var temp_loc_data;

    var main_ui_init = function (map) {
        map_init(map.wrapper, map.lat, map.lng);
        for (var l in map.locs) {
            marker_add(map.locs[l], false);
        }
    }

    var map_init = function (wrapper, lat, lng) {
        _MAP = L.map(wrapper).setView([lat, lng], 14);

        L.tileLayer(cloudmade).addTo(_MAP);

        _MARKER = L.icon({
            iconUrl: '/dyn/tag/020202',
            iconSize: [35, 45]
        });
    }

    var marker_url = function (timestamp) {

        var color = '020202';

        if (timestamp) {
            var now = new Date().getTime();
            var dif = now - timestamp;

            console.log(dif, _TIMEGRID);

            if (dif < 11 * _TIMEGRID) color = '020202';
            if (dif < 10 * _TIMEGRID) color = '1B0A0A';
            if (dif < 9 * _TIMEGRID) color = '341212';
            if (dif < 8 * _TIMEGRID) color = '4D1A1A';
            if (dif < 7 * _TIMEGRID) color = '672323';
            if (dif < 6 * _TIMEGRID) color = '802B2B';
            if (dif < 5 * _TIMEGRID) color = '993333';
            if (dif < 4 * _TIMEGRID) color = 'B33C3C';
            if (dif < 3 * _TIMEGRID) color = 'CC4444';
            if (dif < 2 * _TIMEGRID) color = 'E54C4C';
            if (dif < _TIMEGRID) color = 'FF5555';

            console.log(color);
        }

        return L.icon({
            iconUrl: '/dyn/tag/' + color,
            iconSize: [35, 45]
        })
    }

    var marker_add = function (loc, animate) {
        var popup_content =
            '<h3 class="title">' + loc.address + '</h3>'
          + '<div class="content"><a href="#" onclick="raum.ui.loc.info(event)" class="more-infos" data-id="' + loc._id + '">Infos</a>&nbsp;';

        if (loc.images) {
            if (loc.images.length > 0) {
                popup_content += '<a href="#" onclick="raum.ui.loc.gallery(event)" class="more-infos" data-images="' + loc.images + '">Fotos</a>&nbsp;';
            }
        }

        if ($.cookie('authenticated')) {
            popup_content += '<a href="#" onclick="raum.ui.loc.comment(event)" class"more-infos" data-id="' + loc._id + '">Kommentieren</a>';
        }

        popup_content += '</div>';

        var m = L.marker([loc.lat, loc.lang], { icon: marker_url() }).addTo(_MAP)
          .bindPopup(popup_content);

        if (loc.created) {
            m.setIcon(marker_url(loc.created));
        }
    }

    var loc_info = function (e) {
        e.preventDefault();

        var r = raum.lib.loc.find($(e.target).attr('data-id'));

        $('.info-modal-body').empty();

        for (var v in r) {
            if (['_id', '_rev', 'lang', 'lat', 'images', 'address', 'user', 'comments'].indexOf(v) < 0) {
                if (r[v] !== '') {
                    $('.info-modal-body').append('<span class="bold">' + v + ': </span><span>' + r[v] + '</span><br>');
                }
            }
            if (v === 'address') {
                $('.info-modal-label').text(r[v]);
            }
        }

        if (r.comments) {

            $('.info-modal-body').append('<hr><p>');

            for (var c in r.comments) {
                var date = new Date(r.comments[c].date);
                var d = date.getDate();
                var m = date.getMonth() + 1;
                var y = date.getFullYear();
                $('.info-modal-body').append('<small><strong>' + d + '.' + m + '.' + y + ': </strong>' + r.comments[c].comment + '</small><br>');
            }
            $('.info-modal-body').append('</p>');
        }

        $('.info-modal').modal('show');
    }

    var loc_gallery = function (e) {
        e.preventDefault();

        $.magnificPopup.open({
            items: {
                src: '/img/preloader.gif'
            },
            type: 'image'
        }, 0);

        raum.lib.loc.gallery($(e.target).attr('data-images').split(','), function (res) {
            var images = [];

            for (var i in res) {
                images.push({ src: res[i].size });
            }

            $.magnificPopup.close();
            $.magnificPopup.open({
                items: images,
                type: 'image',
                gallery: {
                    enabled: true
                }

            }, 0);

            $.magnificPopupupdateItemHTML();
        });
    }

    var loc_comment = function (e) {
        e.preventDefault();

        $('.comment-for').val($(e.target).attr('data-id'));
        $('.comment-step-one').show();
        $('.comment-modal button').show();
        $('.comment-modal .close-btn').hide();
        $('.comment-modal').modal('show');
    }

    var message_show = function (message) {
        $('.message span').text(message);
        $('.message').fadeIn('fast').delay(5000).fadeOut('fast');
    }

    return {

        init: function (map) {
            main_ui_init(map);
        },

        // base

        fade_lmnts: function (first, second, callback) {
            if (callback) {
                callback = function () { }
            }

            $(first).fadeOut('fast', function () {
                $(second).fadeIn('fast', callback);
            });
        },

        thumb: {
            temp: function () {
                $('.add-raum').attr('disabled', 'disabled');

                var thumb_wrap = $('<div>').addClass('thumb');
                var thumb_imag = $('<img>').addClass('temp');

                thumb_imag.appendTo(thumb_wrap);
                thumb_wrap.appendTo('.thumbs');
            },
            add: function (image) {
                $('.add-raum').removeAttr('disabled');
                $('img.temp').removeClass('temp').attr('src', image.thumb).attr('data-id', image.id);
            }
        },

        // map functions

        map: {
            init: function (wrapper, lat, lng) {
                map_init(wrapper, lat, lng);
            },
            resize: function () {
                _MAP.invalidateSize(true);
            },
            center: function (lat, lng) {
                // _MAP.set
            }
        },
        marker: {
            add: function (loc, animate) {
                marker_add(loc, animate);
            }
        },
        loc: {
            info: function (event) {
                loc_info(event);
            },
            gallery: function (event) {
                loc_gallery(event);
            },
            comment: function (event) {
                loc_comment(event);
            }
        },

        // messages

        message: {
            show: function (message) {
                message_show(message);
            },
            POSITION_NOT_FOUND: function () {
                message_show('Dein Standort konnte nicht gefunden werden.');
            },
            ADDRESS_NOT_FOUND: function () {
                message_show('Adresse konnte nicht gefunden werden.');
            },
            USERNAME_FILL: function () {
                message_show('Bitte Benutzername ausfüllen.');
            },
            USERNAME_WRONG: function () {
                message_show('Benutzername nicht gefunden.');
            },
            PASSWORD_FILL: function () {
                message_show('Bitte Passwort ausfüllen.');
            },
            PASSWORD_WRONG: function () {
                message_show('Falsches Passwort.');
            }
        }
    }
})();