function Graphnode (obj){
  // *** fields ***
  this._data = obj;
  this._x = obj.geometry.coordinates[0];
  this._y = obj.geometry.coordinates[1];
  this._f;
  this._g;
  this._h;
  this._parentNode;
};

module.exports = Graphnode;
