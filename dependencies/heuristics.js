//Manhattan
public static function manhattan(node:INode, destinationNode:INode, cost:Number = 1.0):Number {
	return Math.abs(node.x – destinationNode.x) * cost + Math.abs(node.y + destinationNode.y) * cost;
}

//Euclidean
public static function euclidianHeuristic(node:INode, destinationNode:INode, cost:Number = 1.0):Number {
	var dx:Number = node.x - destinationNode.x;
	var dy:Number = node.y - destinationNode.y;
	return Math.sqrt( dx * dx + dy * dy ) * cost;
}

//Diagonal
public static function diagonalHeuristic(node:INode, destinationNode:INode, cost:Number = 1.0, diagonalCost:Number = 1.0):Number {
	var dx:Number = Math.abs(node.x - destinationNode.x);
	var dy:Number = Math.abs(node.y - destinationNode.y);
	var diag:Number = Math.min( dx, dy );
	var straight:Number = dx + dy;
	return diagonalCost * diag + cost * (straight - 2 * diag);
}
