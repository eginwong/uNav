var express = require('express');
var server = require('http').Server(app);
var bodyParser = require('body-parser');

var app = express();

app.use(express.static('client'));

app.get('/*', function(req, res, next){
  var url = req.url;
  console.log('/GET', req.url);
  //Checking for urls like ../../passwd etc
  if(!url.match(/\.\.+?\//)){
    res.sendFile(req.url, {root:'./client'});
  } else if(url === '/'){
    next();
  } else {
    res.status(405).send('Did you try something naughty?');
  }
});

app.get('/', function(req, res){
  res.sendFile('index.html', {root:'./client'});
});

//Config checks process.env, otherwise sets to 9000
var port = process.env.PORT || 9000;

module.exports.listen = function(){
  server.listen(port, function(){
    console.log('Server listening on port', port);
  })
};


// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// var router = express.Router();              // get an instance of the express Router
//
// // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
// router.get('/', function(req, res) {
//   res.json({ message: 'hooray! welcome to our api!' });
// });

// router.route('/buildings')

// post example
// // create a bear (accessed at POST http://localhost:8080/api/bears)
// .POST(function(req, res) {
//
//     var bear = new Bear();      // create a new instance of the Bear model
//     bear.name = req.body.name;  // set the bears name (comes from the request)
//
//     // save the bear and check for errors
//     bear.save(function(err) {
//         if (err)
//             res.send(err);
//
//         res.json({ message: 'Bear created!' });
//     });
//
// });

// get example
// .get(function(req, res) {
//     res.send(err);
//     res.json(bears);
//   });
// });

// router.route('/bears/:bear_id')
//
// // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
// .get(function(req, res) {
//   Bear.findById(req.params.bear_id, function(err, bear) {
//     if (err)
//     res.send(err);
//     res.json(bear);
//   });
// });




// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
// app.use('/api', router);
