# uNav

###Installation

```sh
$ npm install
$ cd front_end
$ grunt serve
```

###January 29, 2016
Need to figured out a way to store all the image (in an array?) and swap simultaneously when user reach a certain location (stairs) to go to the next floor.



###January 25, 2016

Killed the demo today for PUM 1 with medium fidelity. Got to crank it and figure out how to do A* and how to store the nodes based on those libraries.

1. Are we going to link up to googlemaps api?
2. How are we going to do the UI?
3. Virtual Tours? Without blowing up the mobile version?
4. Setting up nodes that will be unavailable after certain hours (coffee shops)?

###January 22, 2016

1. Navigation - closest to which node in a multi-pointed room?
For GeoJSON, should we use multipoints or should we use a combination of [points](http://geojson.org/geojson-spec.html#positions)
 instead?

~~2. Are we deploying via some web server? Running locally? Throwing python scripts online? Chucking python scripts entirely?
[A* for JS](http://www.briangrinstead.com/blog/astar-search-algorithm-in-javascript)
Note: Python got chucked. Have to properly apply A* in JavaScript.~~

###January 7, 2016

This is the basic template that will be used for each of our weekly sprints. Hopefully, we'll get some good navigation going on here.

Cheers.

uNav dev
