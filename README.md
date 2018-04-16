# raum ...

... is a pretty tiny crowdmapping app made with love and whipped cream.

Basically, raum is a map and every registered user can mark a location with notes and photos. That's pretty much all there is.

To get it running have a look at [app/config_example.json](https://github.com/thgie/raum/blob/master/app/config_example.json). Make a copy of it to app/config.json and get together all the keys and values and whatnot you need.

### config.json

- theme: for generating the assets folder
- secret_key: for hashing user passwords
- googlemaps*: ...
- couch: a running couch instance with an admin user
- twitter: used to login to flickr ([get token here](https://github.com/chbrown/autoauth))
- cloudmade: for the maptiles

### more information

I have my raum instance running on a raspberry pi in the capitol of switzerland. Have a look at it at [raum.rast.be](http://raum.rast.be).

raum came out of [RAST](http://rast.be) because we needed a way to keep track of empty spaces in the city.