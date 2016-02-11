# uNav

###Installation

```sh
$ npm install
$ nodemon index.js
```
###February 11, 2016
Added API capability to node server through express. It's phenomenal. Returning parsed buildings at the moment, but will have to think about how to search through that array of arrays to return the exact data I want (which is what?).

###February 10, 2016
Rewrote/ported codebase into nodejs and npm. No longer using grunt but that may change in the future. The application can now be deployed onto heroku.

###February 8, 2016
Also destroyed the PUM2 demo today.

Finally integrated Frontend and backend code into one codebase. Still have to work on the actual integration via npm and express.js, but that will be the goal of this week. It was a pain in the ass enough to clean up the repository.

###January 29, 2016
Need to figured out a way to store all the image (in an array?) and swap simultaneously when user reach a certain location (stairs) to go to the next floor.

###January 25, 2016

Killed the demo today for PUM 1 with medium fidelity. Got to crank it and figure out how to do A* and how to store the nodes based on those libraries.

1. Are we going to link up to googlemaps api?

~~2. How are we going to do the UI? With CAD drawings~~

3. Virtual Tours? Without blowing up the mobile version?

4. Setting up nodes that will be unavailable after certain hours (coffee shops)?

###January 22, 2016

~~1. Navigation - closest to which node in a multi-pointed room?
For GeoJSON, should we use multipoints or should we use a combination of [points](http://geojson.org/geojson-spec.html#positions)
 instead?~~

~~2. Are we deploying via some web server? Running locally? Throwing python scripts online? Chucking python scripts entirely?
[A* for JS](http://www.briangrinstead.com/blog/astar-search-algorithm-in-javascript)
Note: Python got chucked. Have to properly apply A* in JavaScript.~~

###January 7, 2016

This is the basic template that will be used for each of our weekly sprints. Hopefully, we'll get some good navigation going on here.

Cheers.

uNav dev
