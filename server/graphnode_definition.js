/*
Define the graph node object. f,g,h, parentnode are required fields for pathfinding.
*/

function Graphnode (obj){
  // *** fields ***
  this._id = obj.properties.building_code + obj.properties.id;
  this._data = obj.properties;
  this._x = obj.geometry.coordinates[0];
  this._y = obj.geometry.coordinates[1];
  this._z = obj.geometry.coordinates[2];
  this._f;
  this._g;
  this._h;
  this._parentNode;
};

module.exports = Graphnode;
