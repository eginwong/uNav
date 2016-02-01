'use strict'
//Requires jQuery
/*
2. Add functions to add nodes/setnodes, add eges, set edges.

4. test out graph object
5. define heuristics
6. start on a star
*/

// Graph will always be undirected, as per our requirements.

// Graph needs x, y, name, f, g, h, connected nodes,

var obj = {
  "type":"Feature",
  "properties":{
    "building_code":"RCH",
    "utility": "Hallway",
    "id":"122H7",
    "name":""
  },
  "geometry":{
    "type":"Point",
    "coordinates":[
      -80.54053791999999,
      43.469295460000005
    ]
  }
};

var obj2 = {
  "type":"Feature",
  "properties":{
    "building_code":"RCH",
    "utility": "Hallway",
    "id": "122H6",
    "name":""
  },
  "geometry":{
    "type":"Point",
    "coordinates":[
      -80.54059842,
      43.469295460000005
    ]
  }
};

var obj3 =     {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [
      -80.540973,
      43.470131,
      1
    ]
  },
  "properties": {
    "building_code": "RCH",
    "id": "120S",
    "utility": "Stairs",
    "name":""
  }
};

function Graphnode (obj){
  // *** fields ***
  this._id = obj.properties.building_code + obj.properties.id;
  this._data = obj;
  this._x = obj.geometry.coordinates[0];
  this._y = obj.geometry.coordinates[1];
  this._f;
  this._g;
  this._h;

  // *** methods ***

};

function Graph () {
  // *** fields ***
  this._nodes = [];       // each item in the list will be a Graphnode
  this._nodeCount = 0;
  this._edgeCount = 0;
  this._adjacency = {};
}

Graph.prototype = {

  exists: function(node){
    return (typeof node === 'undefined') ? false: true;
  },

  addNode: function(node) {
    var newName = node.properties.building_code + node.properties.id;
    var check = true;
    console.log(newName);
    for (var i=0; i< this._nodes.length; i++) {
      if(this._nodes[i]._id == newName){
        console.log("this node has already been added");
        check = false;
      }
    }
    if(check) {this._nodes.push(new Graphnode(node));++this._nodeCount;}
  },

  dropNode: function(id) {
    for(var i=this._nodes.length-1; i>=0; i--) {
      if( this._nodes[i]._id == id) {
        this._nodes.splice(i,1);
        console.log("the node is removed.");
      }
    }
    --this._nodeCount;
  },

  addEdge: function(node1, node2) {
    //check if node exists
    var edgeAdd = true;
    var insert = false;
    if (!this.exists(node1) || !this.exists(node2)) {
      console.log("undefined node");
    }
    else {
      // calculate and store distance
      var weight = manhattan(node1,node2);
      if(!this.exists(this._adjacency[node1._id])){
        this._adjacency[node1._id] = [{"id": node2._id, "weight": weight}];
        insert = true;
      }
      else {
        //check if that id already exists
        var index;
        $.each(this._adjacency[node1._id], function (ind, val) {
          if(node2._id == val.id) {
            index = ind;
          }
        });

        if(index > -1){
          this._adjacency[node1._id].splice(index, 1);
          this._adjacency[node1._id].splice(index, 0, {"id": node2._id, "weight": weight});
          insert = true;
          edgeAdd = false;
        }
        if (!insert) {
          this._adjacency[node1._id].push({"id": node2._id, "weight": weight});
        }
      }
      //reset vars for next node.
      insert = false;
      index = -1;

      if(!this.exists(this._adjacency[node2._id])){
        this._adjacency[node2._id] = [{"id": node1._id, "weight": weight}];
      }
      else {
        //check if that id already exists
        $.each(this._adjacency[node2._id], function (ind, val) {
          if(node1._id == val.id) {
            index = ind;
          }
        });

        if(index > -1){
          this._adjacency[node2._id].splice(index, 1);
          this._adjacency[node2._id].splice(index, 0, {"id": node1._id, "weight": weight});
          insert = true;
          //redundant but makes the code clearer
          edgeAdd = false;
        }
        if (!insert) {
          this._adjacency[node2._id].push({"id": node1._id, "weight": weight});
        }
      }
    }
    if(edgeAdd){++this._edgeCount;}
  },

  //not working as of yet
  dropEdge: function(node1, node2) {
    if (!this.exists(node1) || !this.exists(node2)) {
      console.log("undefined node");
    }
    else{
      var index;
      var edgeDrop = false;
      $.each(this._adjacency[node1._id], function (ind, val) {
        if(node2._id == val.id) {
          index = ind;
        }
      });

      if(index > -1){
        this._adjacency[node1._id].splice(index, 1);
        edgeDrop = true;
        console.log("edge1 has been dropped");
      }
      //reseting vars, although redundant for edgeDrop.
      index = -1;
      edgeDrop = false;

      $.each(this._adjacency[node2._id], function (ind, val) {
        if(node1._id == val.id) {
          index = ind;
        }
      });

      if(index > -1){
        this._adjacency[node2._id].splice(index, 1);
        edgeDrop = true;
        console.log("edge2 has been dropped");
      }
      if(edgeDrop){--this._edgeCount;}
    }
  },

  adjacent: function(node){
    return this._adjacency[node._id];
  }
}

//Heurisitic Definitions
function manhattan(source, dest) {
  return (Math.abs(source._x - dest._x) + Math.abs(source._y - dest._y));
}

function euclidean(source, dest) {
  return Math.sqrt(Math.pow(source._x - dest._x, 2) + Math.pow(source._y - dest._y, 2));
}

//Chebyshev's algorithm, D2=D=1
function diagonal(source, dest) {
  var dx = Math.abs(source._x - dest._x);
  var dy = Math.abs(source._y - dest._y);
  return ((dx + dy) - Math.min(dx,dy));
}

// let's do some testing!

var g = new Graph();
g.addNode(obj);
g.addNode(obj2);
g.addNode(obj3);
// g.dropNode("RCH122H7")
console.log(g._nodeCount);
g.addEdge(g._nodes[0], g._nodes[1]);
g.addEdge(g._nodes[0], g._nodes[2]);
// g.dropEdge(g._nodes[0], g._nodes[2]);
console.log(g.adjacent(g._nodes[0]));
// console.log(manhattan(g._nodes[0],g._nodes[1]));
// console.log(euclidean(g._nodes[0],g._nodes[1]));
// console.log(diagonal(g._nodes[0],g._nodes[1]));
