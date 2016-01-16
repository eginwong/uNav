//https://stackoverflow.com/questions/24545909/import-data-from-csv-file-to-html-table-using-javascript
function makeTable (txt) {

    var rows = txt.split('\n');
    table = document.getElementById("coordinatesTable");
    tr = null, td = null,
    tds = null;

    for ( var i = 0; i<rows.length; i++ ) {
        var row = table.insertRow(1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        tds = rows[i].split(',');
        alert(tds);
        for ( var j = 0; j < tr.length; j++ ) {
          td.innerHTML = tds[j];
           tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}
