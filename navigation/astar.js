function aStar (graph, src, sink){
  if(graph.exists(src) && graph.exists(sink)){
    // initializing all the variables.
    var openNodes = new BinaryHeap(function(x){return x;});
    var closedNodes = [];
    var currentNode; var destNode; var testNode;
    $.each(graph._nodes, function(ind, val) {
      if(val._id == src){
        currentNode = graph._nodes[ind];
        currentNode._g = 0;
        //set heuristic choice here.
        currentNode._h = manhattan(currentNode, destNode);
        currentNode._f = currentNode._g + currentNode._h;
      }
      if(val._id == sink){
        destNode = graph._nodes[ind];
      }
    });

    var connectedNodes;
    var g; var h; var f;
    var l = graph._nodes.length;

    // while (currentNode != destNode) {
    connectedNodes = findConnectedNodes(graph, currentNode._id );
    l = connectedNodes.length;
    for (var i = 0; i < l; ++i) {
      $.each(graph._nodes, function(ind, val) {
        if(val._id == connectedNodes[i].id){
          testNode = graph._nodes[ind];
        }
      });
      console.log(testNode);
      if (graph._adjacency[testNode._id].length > 0) {
        //***** figure out what's wrong with f,g,h
        g = currentNode._g;
        h = manhattan(testNode, destNode);
        f = g + h;
        console.log("The value for f is " + f);
        if ( $.inArray(testNode, openNodes) > -1 || $.inArray(testNode, closedNodes) > -1)	{
          if(testNode._f > f)
          {
            testNode._f = f;
            testNode._g = g;
            testNode._h = h;
            testNode._parentNode = currentNode;
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
    }

    // 		} <-- for
    // 		closedNodes.push( currentNode );
    // 		if (openNodes.length == 0) {
    // 			return null;
    // 		}
    // 		openNodes.sortOn('f', Array.NUMERIC);
    // 		currentNode = openNodes.shift() as INode;
    // }
  }
  else {
    console.log("your nodes don't exist");
  }
}

function findConnectedNodes(graph, nodeID)
{
  return graph._adjacency[nodeID];
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
