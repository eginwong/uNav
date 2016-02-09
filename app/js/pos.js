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
  ImgPos = FindPosition(container);
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

  var canvas = document.getElementById("myCanvas");
  var context = canvas.getContext("2d");
  context.fillStyle="#FF0000";
  context.fillRect( PosX, PosY, 5, 5 );

}

function ImportCoordinates()
{
  var color = '#FF0000';
  var size = '5px';

  var table = document.getElementById("coordinatesTable");
  for (var i = 1, row; row = table.rows[i]; i++) {
    PosX = row.cells[0].innerHTML;
    PosY = row.cells[1].innerHTML;

    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");
    context.fillStyle="#FF0000";
    context.fillRect( PosX, PosY, 5, 5 );
  }
}

$(function(){
  $("#export").click(function(){
    $("#coordinatesTable").tableToCSV();
  });

  $("#import").click(function(){
    document.getElementById("import").style.display = 'block';
    this.style.display = 'none';
    ImportCoordinates();
  });

  $("#container").click(function(){
    var container = document.getElementById("container");
    checkTable();
    container.onmousedown = GetCoordinates;
  });

});

$(document).ready(function() {
  if(isAPIAvailable()) {
    $('#files').bind('change', handleFileSelect);
  }
  var uw_buildings = $.getJSON( "https://api.uwaterloo.ca/v2/buildings/list.geojson?key=2a7eb4185520ceff7b74992e7df4f55e", function(data) {
    $.each(data.features, function(i, option) {
      if(i != 0) {
        $('#sel').append($('<option/>').attr("value", option.properties.building_code).text(option.properties.building_code));
      }});
  })
});

function isAPIAvailable() {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    return true;
  } else {
    // source: File API availability - http://caniuse.com/#feat=fileapi
    // source: <output> availability - http://html5doctor.com/the-output-element/
    document.writeln('The HTML5 APIs used in this form are only available in the following browsers:<br />');
    // 6.0 File API & 13.0 <output>
    document.writeln(' - Google Chrome: 13.0 or later<br />');
    // 3.6 File API & 6.0 <output>
    document.writeln(' - Mozilla Firefox: 6.0 or later<br />');
    // 10.0 File API & 10.0 <output>
    return false;
  }
}

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  var file = files[0];

  // read the file metadata
  var output = ''
  output += '<span style="font-weight:bold;">' + escape(file.name) + '</span><br />\n';
  output += ' - LastModified: ' + (file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a') + '<br />\n';

  // read the file contents
  printTable(file);

  // post the results
  $('#list').append(output);
  $('#files').css(this.style.display = 'none');
}

function checkTable() {
  var count = $('#coordinatesTable tr').length;
  if (count <= 0) {
    $('#coordinatesTable').append("<tr><th>X coordinate</th><th>Y coordinate</th><th>Room Number</th></tr>");
  }
}

function printTable(file) {
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event){
    var csv = event.target.result;
    var data = $.csv.toArrays(csv);
    var html = '';
    checkTable();
    for(var row in data) {
      html += '<tr>\r\n';
      for(var item in data[row]) {
        html += '<td>' + data[row][item] + '</td>\r\n';
      }
      html += '</tr>\r\n';
    }
    $('#coordinatesTable').append(html);
  };
  reader.onerror = function(){ alert('Unable to read ' + file.fileName); };
}
