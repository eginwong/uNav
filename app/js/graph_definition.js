'use strict'
//Requires jQuery

// Graph will always be undirected, as per our requirements.

function Graphnode (obj){
  // *** fields ***
  this._id = obj.properties.building_code + obj.properties.id;
  this._data = obj;
  this._x = obj.geometry.coordinates[0];
  this._y = obj.geometry.coordinates[1];
  this._f;
  this._g;
  this._h;
  this._parentNode;
};

function Graph () {
  this._nodes = [];       // each item in the list will be a Graphnode
  this._nodeCount = 0;
  this._edgeCount = 0;
  this._adjacency = {};
}

Graph.prototype = {

  // Check if node exists.
  exists: function(node){
    return (typeof node == 'undefined') ? false: true;
  },

  retr: function(id) {
    var index;
    $.each(this._nodes, function(ind, val) {
      if(val._id === id){
        index = ind;
      }
    });
    return this._nodes[index];
  },

  adjacent: function(node){
    return this._adjacency[node._id];
  },

  addNode: function(graph, node) {
    var newName = node.properties.building_code + node.properties.id;
    var obj = graph.retr(node);
    if (obj != undefined){
      if(obj._id == newName){
        console.log("this node has already been added");
      }
    }
    else {
      this._nodes.push(new Graphnode(node));
      ++this._nodeCount;
    }
  },

  dropNode: function(graph, id) {
    var target = graph.retr(id);

    if(target){
      // Removing connected edges.
      var removeArray = this._adjacency[target._id].slice();
      if(removeArray == undefined) {
        console.log("Node does not have defined edges.");
      }
      else{
        $.each(removeArray, function(ind, val){
          graph.dropEdge(graph, target._id, val.id);
        });
        delete this._adjacency[target._id];
      }
      // for actually removing the node.
      for(var i=this._nodes.length-1; i>=0; i--) {
        if( this._nodes[i]._id == id) {
          this._nodes.splice(i,1);
          console.log("the node is removed.");
        }
      };
      --this._nodeCount;
    }
    else {
      console.log("This node doesn't exist");
    }
  },

  addEdge: function(graph, id1, id2) {
    //check if node exists
    var edgeAdd = true;
    var insert = false;
    var node1 = graph.retr(id1);
    var node2 = graph.retr(id2);
    if (node1 == undefined || node2 == undefined) {
      console.log("undefined node");
    }
    else {
      // calculate and store distance
      if(!this.exists(this._adjacency[node1._id])){
        this._adjacency[node1._id] = [{"id": node2._id}];
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
          this._adjacency[node1._id].splice(index, 0, {"id": node2._id});
          insert = true;
          edgeAdd = false;
        }
        if (!insert) {
          this._adjacency[node1._id].push({"id": node2._id});
        }
      }
      //reset vars for next node.
      insert = false;
      index = -1;

      if(!this.exists(this._adjacency[node2._id])){
        this._adjacency[node2._id] = [{"id": node1._id}];
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
          this._adjacency[node2._id].splice(index, 0, {"id": node1._id});
          insert = true;
          //redundant but makes the code clearer
          edgeAdd = false;
        }
        if (!insert) {
          this._adjacency[node2._id].push({"id": node1._id});
        }
      }
    }
    if(edgeAdd){++this._edgeCount;}
  },

  dropEdge: function(graph, id1, id2) {
    var node1 = graph.retr(id1);
    var node2 = graph.retr(id2);
    if (node1 == undefined || node2 == undefined) {
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
}
