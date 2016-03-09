var express = require('express');
var app = express();
var server = require('http').Server(app);
var request = require('request');
var fs = require("fs");
var nodemailer = require('nodemailer');
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// For navigation
var algo = require('./astar.js');
var graphDef = require('./graph_definition.js');

var g = new graphDef();
fs.readFile('data/coordinates/geojson/RCH1_nodes_geo.json', 'utf8', function (err,data) {
  var geo_nodes = JSON.parse(data);
  for (var ind in geo_nodes.features) {
    g.addNode(g, geo_nodes.features[ind]);
  }
  fs.readFile('data/coordinates/edges/edges_RCH01.json', 'utf8', function (err,data2) {
    var edges = JSON.parse(data2);
    for (var ind in edges.vals) {
      g.addEdge(g, edges.vals[ind].id1, edges.vals[ind].id2);
    }
  });
});
fs.readFile('data/coordinates/geojson/RCH2_nodes_geo.json', 'utf8', function (err,data) {
  var geo_nodes = JSON.parse(data);
  for (var ind in geo_nodes.features) {
    g.addNode(g, geo_nodes.features[ind]);
  }
  fs.readFile('data/coordinates/edges/edges_RCH02.json', 'utf8', function (err,data2) {
    var edges = JSON.parse(data2);
    for (var ind in edges.vals) {
      g.addEdge(g, edges.vals[ind].id1, edges.vals[ind].id2);
    }
  });
});
fs.readFile('data/coordinates/geojson/RCH3_nodes_geo.json', 'utf8', function (err,data) {
  var geo_nodes = JSON.parse(data);
  for (var ind in geo_nodes.features) {
    g.addNode(g, geo_nodes.features[ind]);
  }
  fs.readFile('data/coordinates/edges/edges_RCH03.json', 'utf8', function (err,data2) {
    var edges = JSON.parse(data2);
    for (var ind in edges.vals) {
      g.addEdge(g, edges.vals[ind].id1, edges.vals[ind].id2);
    }
  });
});
fs.readFile('data/coordinates/geojson/E20_nodes_geo.json', 'utf8', function (err,data) {
  var geo_nodes = JSON.parse(data);
  for (var ind in geo_nodes.features) {
    g.addNode(g, geo_nodes.features[ind]);
  }
});
fs.readFile('data/coordinates/geojson/E21_nodes_geo.json', 'utf8', function (err,data) {
  var geo_nodes = JSON.parse(data);
  for (var ind in geo_nodes.features) {
    g.addNode(g, geo_nodes.features[ind]);
  }
  fs.readFile('data/coordinates/edges/edges_E21.json', 'utf8', function (err,data2) {
    var edges = JSON.parse(data2);
    for (var ind in edges.vals) {
      g.addEdge(g, edges.vals[ind].id1, edges.vals[ind].id2);
    }
    fs.readFile('data/coordinates/edges/edges_RCH_Connectors.json', 'utf8', function (err,data3) {
      var edges = JSON.parse(data3);
      for (var ind in edges.vals) {
        g.addEdge(g, edges.vals[ind].id1, edges.vals[ind].id2);
      }
    });
  });
});
fs.readFile('data/coordinates/geojson/DC_nodes_geo.json', 'utf8', function (err,data) {
  var geo_nodes = JSON.parse(data);
  for (var ind in geo_nodes.features) {
    g.addNode(g, geo_nodes.features[ind]);
  }
});

var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/buildings')

// get example
.get(function(req, res) {
  if (!fs.existsSync("./uwapi_results.json")) {
    request('https://api.uwaterloo.ca/v2/buildings/list.geojson?key=2a7eb4185520ceff7b74992e7df4f55e', function (error, response, body) {
      var BuildingResults = {};
      if (!error && response.statusCode == 200) {
        var inBuildings = JSON.parse(body);

        for (var ind in inBuildings.features) {
          if (ind != 0) {
            BuildingResults[inBuildings.features[ind].properties.building_code] = {name: inBuildings.features[ind].properties.building_name, coordinates: inBuildings.features[ind].geometry.coordinates};
          }
        }
      }
      fs.writeFile( "uwapi_results.json", JSON.stringify(BuildingResults), "utf8");
      res.send(JSON.stringify(BuildingResults));
    })
  }
  else {
    fs.readFile('./uwapi_results.json', 'utf8', function (err,data) {
      if (err) {
        res.send(err);
      }
      res.send(data);
    })
  }
});

router.route('/graph')

.get(function(req,res){
  res.send(JSON.stringify(g));
})

router.route('/graph/amenities/:id')

.get (function(req,res){
  var nodes = [];
  var hold;
  function asyncFind(_callback){
    if(req.params.id == "WC"){
      for (var key in g._nodes) {
        hold = g._nodes[key]._data.utility;
        for (var i in hold){
          if(hold[i] == req.params.id || hold[i] == "WC-M" || hold[i] == "WC-W"){
            nodes.push(g._nodes[key]);
          }
        }
      }
    }
    else{
      for (var key in g._nodes) {
        hold = g._nodes[key]._data.utility;
        for (var i in hold){
          if(hold[i] == req.params.id ){
            nodes.push(g._nodes[key]);
          }
        }
      }
    }
    _callback();
  }

  // call first function and pass in a callback function which
  // first function runs when it has completed
  asyncFind(function() {
    res.send(JSON.stringify(nodes));
  });
})

router.route('/graph/rooms/select/:id')

.get (function(req,res){
  var rooms = [];
  var hold;
  function asyncFind(_callback){
    for (var key in g._nodes) {
      if(g._nodes[key]._data.building_code == req.params.id){
        hold = g._nodes[key]._data.utility;
        if(hold[0] == undefined){
          if(req.params.id == "RCH"){ rooms.push(req.params.id + " " + key.substr(3));}
          else{ rooms.push(req.params.id + " " + key.substr(2));}
        }
        else{
          for (var i in hold){
            if(hold[i] != "Hallway" && hold[i] != "Entrance"){
              if(req.params.id =="RCH") {rooms.push(req.params.id + " " + key.substr(3));}
              else{rooms.push(req.params.id + " " + key.substr(2));}
              break;
            }
            else{break;}
          }
        }
      }
    }
    rooms.sort();
    _callback();
  }

  // call first function and pass in a callback function which
  // first function runs when it has completed
  asyncFind(function() {
    if(rooms.length > 0){
      res.send(JSON.stringify(rooms));
    }
    else{
      res.send(undefined);
    }
  });
})


// If you want to display everything
router.route('/graph/rooms')

.get (function(req,res){
  var rooms = [];
  var hold;
  var build;
  function asyncFind(_callback){
    for (var key in g._nodes) {
      hold = g._nodes[key]._data.utility;
      build = g._nodes[key]._data.building_code;
      if(hold[0] == undefined){
        if(/\w{3}/.test(build)){ rooms.push(build + " " + key.substr(3));}
        else{ rooms.push(build + " " + key.substr(2));}
      }
      else{
        for (var i in hold){
          if(hold[i] != "Hallway" && hold[i] != "Entrance" && hold[i] != "Outdoor"){
            if(/\w{3}/.test(build)) {rooms.push(build + " " + key.substr(3));}
            else{rooms.push(build + " " + key.substr(2));}
            break;
          }
          else{break;}
        }
      }
    }
    rooms.sort();
    _callback();
  }

  // call first function and pass in a callback function which
  // first function runs when it has completed
  asyncFind(function() {
    if(rooms.length > 0){
      res.send(JSON.stringify(rooms));
    }
    else{
      res.send(undefined);
    }
  });
})


router.route('/graph/rooms/:id')

.get(function(req,res){
  res.send(JSON.stringify(g._nodes[req.params.id]));
})


router.route('/astar/:src/:sink/:options')
.get(function(req, res) {
  if(req.params.options == "none"){
    res.send(algo.aStar(g, req.params.src, req.params.sink, "none"));
  }
  if(req.params.options == "stairs"){
    res.send(algo.aStar(g, req.params.src, req.params.sink, "stairs"));
  }
  if(req.params.options == "elevators"){
    res.send(algo.aStar(g, req.params.src, req.params.sink, "elevators"));
  }
});

router.route('/contact-form')

.post(function(req,res){
  var transporter = nodemailer.createTransport('smtps://unavfydp%40gmail.com:coconutwater@smtp.gmail.com');
  var data = req.body;

  transporter.sendMail({
    from: 'unavfydp@gmail.com',
    cc: data.contactEmail,
    bcc: 'e.gin.wong@gmail.com',
    to: 'unavfydp@gmail.com',
    subject: 'Support Message: ' + data.contactReason + ' from ' + data.contactName,
    text: data.contactMsg
  })
  res.json(data);
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

app.use(express.static('client'));

app.get('/*', function(req, res, next){
  var url = req.url;
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
  });
};
