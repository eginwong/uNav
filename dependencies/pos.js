function FindPosition(oElement)
{
  if(typeof( oElement.offsetParent ) != "undefined")
  {
    for(var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent)
    {
      posX += oElement.offsetLeft;
      posY += oElement.offsetTop;
    }
    return [ posX, posY ];
  }
  else
  {
    return [ oElement.x, oElement.y ];
  }
}

function GetCoordinates(e)
{
  var PosX = 0;
  var PosY = 0;
  var ImgPos;
  ImgPos = FindPosition(myImg);
  if (!e) var e = window.event;
  if (e.pageX || e.pageY)
  {
    PosX = e.pageX;
    PosY = e.pageY;
  }
  else if (e.clientX || e.clientY)
  {
    PosX = e.clientX + document.body.scrollLeft
    + document.documentElement.scrollLeft;
    PosY = e.clientY + document.body.scrollTop
    + document.documentElement.scrollTop;
  }
  PosX = PosX - ImgPos[0];
  PosY = PosY - ImgPos[1];

  document.getElementById("x").innerHTML = PosX;
  document.getElementById("y").innerHTML = PosY;

  var table = document.getElementById("coordinatesTable");
  var row = table.insertRow(1);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  cell1.innerHTML = PosX;
  cell2.innerHTML = PosY;
  var roomNum = prompt("What's the room number?")
  if (roomNum != null) {
    cell3.innerHTML = roomNum;
  }
  var color = '#FF0000';
  var size = '5px';

  $("body").append(
    $('<div></div>')
    .css('position', 'absolute')
    .css('top', PosY + 'px')
    .css('left', PosX + 'px')
    .css('width', size)
    .css('height', size)
    .css('background-color', color)
  );
}
