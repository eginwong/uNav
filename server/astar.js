var BinaryHeap = require('./binary_heap.js');
module.exports = {

  findConnectedNodes: function (graph, nodeID) {
    return graph._adjacency[nodeID];
  },

  buildPath: function (source, dest) {
    var path = [];
    var node = dest;
    path.push(node);
    while (node != source) {
      node = node._parentNode;
      if(node == undefined){
        return [];
      }
      path.unshift( node );
    }
    return path;
  },

  //Heurisitic Definitions
  manhattan: function (source, dest) {
    return (Math.abs(source._x - dest._x) + Math.abs(source._y - dest._y));
  },

  euclidean: function (source, dest) {
    return Math.sqrt(Math.pow(source._x - dest._x, 2) + Math.pow(source._y - dest._y, 2));
  },

  //Chebyshev's algorithm, D2=D=1
  diagonal: function (source, dest) {
    var dx = Math.abs(source._x - dest._x);
    var dy = Math.abs(source._y - dest._y);
    return ((dx + dy) - Math.min(dx,dy));
  },

  containsObject: function(obj, list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i] === obj) {
            return true;
        }
    }
    return false;
  },
  aStar: function (graph, src, sink){
    //finished result to return.
    var fin;
    if(graph._nodes[src] && graph._nodes[sink]){
      // initializing all the variables.
      var openNodes = new BinaryHeap(function(x){return x;});
      var closedNodes = [];
      var startNode; var currentNode; var destNode; var testNode;
      for (var key in graph._nodes) {
        if(key == src){
          currentNode = graph._nodes[key];
        }
        if(key == sink){
          destNode = graph._nodes[key];
        }
      }
      currentNode._g = 0;
      //set heuristic choice here.
      currentNode._h = this.manhattan(currentNode, destNode);
      currentNode._f = currentNode._g + currentNode._h;

      //get starting node
      startNode = currentNode;

      var connectedNodes;
      var g; var h; var f;
      var l;

      while (currentNode != destNode && currentNode != undefined) {
        connectedNodes = this.findConnectedNodes(graph, currentNode._id);
        l = connectedNodes.length;
        for (var i = 0; i < l; ++i) {
          for (var key in graph._nodes) {
            if(key == connectedNodes[i]){
              testNode = graph._nodes[key];
            }
          }
          // technically any node you connect to will be greater than 0, as there has to be one edge to connect to there.
          // However, your destination node may only have one edge connecting to it too. >_<
          if (graph._adjacency[testNode._id].length > 0) {
            g = currentNode._g + this.manhattan(currentNode, testNode);
            h = this.manhattan(testNode, destNode);
            f = g + h;
            if ( this.containsObject(testNode, openNodes) || this.containsObject(testNode, closedNodes))	{
              if(testNode._f > f)
              {
                testNode._f = f;
                testNode._g = g;
                testNode._h = h;
                testNode._parentNode = currentNode;
              }
            }
            else {
              testNode._f = f;
              testNode._g = g;
              testNode._h = h;
              testNode._parentNode = currentNode;
              openNodes.push(testNode);
            }
          }
        }
        closedNodes.push( currentNode );
        if (openNodes.length == 0) {
          return null;
        }
        currentNode = openNodes.pop();
      }
      var dist;
      var path = this.buildPath(startNode, destNode);
      if (path.length == 0){
        return fin;
      }
      else{
        var resultArray = [];
        for (var i = 0; i < path.length; i++){
          resultArray.push(path[i]._id);
          dist = path[i]._f;
        }
        fin = {
          "path": resultArray,
          "dist": dist
        };
        return fin;
      }
    }
    else {
      return fin;
      console.log("your nodes don't exist");
    }
  }
}
