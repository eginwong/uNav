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
    //to get accurate floor mapping
    return(Math.abs(source._x - dest._x) + Math.abs(source._y - dest._y) + Math.abs(source._z - dest._z));
  },

  euclidean: function (source, dest) {
    return Math.sqrt(Math.pow(source._x - dest._x, 2) + Math.pow(source._y - dest._y, 2) + Math.pow(source._z - dest._z, 2));
  },

  //Chebyshev's algorithm, D2=D=1
  diagonal: function (source, dest) {
    var dx = Math.abs(source._x - dest._x);
    var dy = Math.abs(source._y - dest._y);
    var dz = Math.abs(source._z - dest._z);
    return ((dx + dy + dz) - Math.min(dx,dy,dz));
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
    graph.clearParents(graph);
    if(graph._nodes[src] && graph._nodes[sink]){
      // initializing all the variables.
      var openNodes = new BinaryHeap(function(x){return x._f;});
      var closedNodes = [];
      var startNode; var currentNode; var destNode; var testNode;
      currentNode = graph._nodes[src];
      destNode = graph._nodes[sink];

      currentNode._g = 0;
      currentNode._h = this.manhattan(currentNode, destNode);
      currentNode._f = currentNode._g + currentNode._h;

      startNode = currentNode;

      var connectedNodes;
      var g; var h; var f;
      var l;

      while (currentNode != destNode && currentNode != undefined) {
        connectedNodes = this.findConnectedNodes(graph, currentNode._id);
        l = connectedNodes.length;
        for (var i = 0; i < l; ++i) {
          testNode = graph._nodes[connectedNodes[i]];
          // technically any node you connect to will be greater than 0, as there has to be one edge to connect to there.
          // However, your destination node may only have one edge connecting to it too. >_<
          if (graph._adjacency[testNode._id].length > 0) {
            g = currentNode._g + 1;
            // g = currentNode._g + this.manhattan(currentNode, testNode);
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
        var dist = 0;
        for (var i = 0; i < path.length; i++){
          resultArray.push({id: path[i]._id, latitude: path[i]._y, longitude : path[i]._x});
          if(i != 0){
            var lat1 = path[i-1]._y;
            var lon1 = path[i-1]._x;
            var lat2 = path[i]._y;
            var lon2 = path[i]._x;
            var R = 6378.137; // Radius of earth in KM
            var dLat = (lat2 - lat1) * Math.PI / 180;
            var dLon = (lon2 - lon1) * Math.PI / 180;
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c * 1000;
            dist+= d;
          }
        }
        resultArray.push({dist: dist});
        fin = resultArray;
        return fin;
      }
    }
    else {
      return fin;
      console.log("your nodes don't exist");
    }
  }
}
