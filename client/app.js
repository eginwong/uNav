/*
Angular app declaration here, noting all the modules that are being imported.
*/

var uNav = angular.module('uNav', ['ui', 'ui.utils', 'ngRoute', 'ui.bootstrap', 'uiGmapgoogle-maps', 'ngResource']).
config(function($routeProvider, $locationProvider, uiGmapGoogleMapApiProvider) {
  $locationProvider.hashPrefix('');
  // Specific routing, by partial and controller
  $routeProvider.
  when('/',         { templateUrl : 'app/partials/home.html',     controller: 'mainController'}).
  when('/navigate', { templateUrl: 'app/partials/navigate.html',  controller: 'navigateController'}).
  when('/nearyou',  { templateUrl: 'app/partials/nearyou.html',   controller: 'nearyouController'}).
  when('/about',    { templateUrl: 'app/partials/about.html'}).
  when('/contact',  { templateUrl: 'app/partials/contact.html',   controller: 'contactController'});

  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyCYtcbfLrd9BGzJ8HPdvsxDEedBdh3F-z4',
    v: '3.24', //defaults to latest 3.X anyhow
    libraries: 'weather,geometry,visualization'
  });
});

$(document).on('click.nav','.navbar-collapse.in',function(e) {
  if( $(e.target).is('a') ) {
    $(this).removeClass('in').addClass('collapse');
  }
});

// Local controller, instantiate google maps API. Set styling to begin with.
uNav.controller('mainController', function($scope, uiGmapGoogleMapApi, uiGmapIsReady) {
  // uiGmapGoogleMapApi is a promise.
  // The "then" callback function provides the google.maps object.
  uiGmapGoogleMapApi.then(function (maps) {
    $scope.map = {
      center: {
        latitude: 43.4722854,
        longitude: -80.5448576
      },
      zoom: 15,
      pan: 1,
      options: $scope.mapOptions,
      markers: [],
      events: {},
      control: {}
    }
  });

  uiGmapIsReady.promise() // if no value is put in promise() it defaults to promise(1)
  .then(function (instances) {
  })

  $scope.mapOptions = {
    minZoom: 3,
    zoomControl: false,
    draggable: true,
    navigationControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    disableDoubleClickZoom: false,
    keyboardShortcuts: true,
    markers: {
      selected: {}
    },
    styles: [{
      stylers: [
        { hue: "#00ffe6" },
        { saturation: -20 }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: 100 },
        { visibility: "simplified" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    },{
      featureType: "buildings",
      elementType: "labels.text",
      stylers: [
        { visibility: "off" }
      ]
    }]
  };

  $scope.windowOptions = {
    visible: false,
  };

});

// Navigate controller where all the search functionality is bundled together.
uNav.controller('navigateController', function($scope, $q, $timeout, $resource, $location, RoomService, uiGmapIsReady) {

  // To reset the map between routing.
  uiGmapIsReady.promise() // if no value is put in promise() it defaults to promise(1)
  .then(function (instances) {
    $scope.map.markers = [];
    $scope.map.center = {latitude: 43.4722854, longitude: -80.5448576};
    $scope.map.zoom = 15;
  })

  // Instantiate variables.
  $scope.stairs = false;
  $scope.elevator = false;
  $scope.load = false;
  $scope.collapsed = true;

  $scope.closeClick = function() {
    $scope.transitOn = false;
  };

  // Show infowindow for only the specific marker with id 1000.
  $scope.transitClick = function(e){
    if(e.m.id == 1000){
      $scope.transition = e.m;

      $scope.infoContent = e.m.content;
      $timeout(function() {
        $scope.$apply();
      },0);
    }
  }

  // Toggle for the options from the frontend for avoidances in navigation.
  $scope.opt = function(util){
    if(util == "Stairs"){
      $scope.stairs = !$scope.stairs;
      if($scope.stairs && $scope.elevator){
        $scope.elevator = false;
      }
    }
    if(util == "Elevator"){
      $scope.elevator = !$scope.elevator;
      if($scope.stairs && $scope.elevator){
        $scope.stairs = false;
      }
    }

    //What if both are true?
    if($scope.elevator){$("#elevatorIcon").addClass("btn-primary");}
    else{$("#elevatorIcon").removeClass("btn-primary");}

    if($scope.stairs){$("#stairIcon").addClass("btn-primary");}
    else{$("#stairIcon").removeClass("btn-primary");}

    // Replot after user interacts with either of the buttons for avoidances.
    if($scope.dest != undefined){
      plot("dest").then(function(resp){
        if(resp._data.utility.length <= 0){$("#l2Details").text("Room");}
        else {$("#l2Details").text(resp._data.utility.toString().replace(/,/g, ', '));}
        if(typeof $scope.src !== 'undefined' && typeof $scope.dest !== 'undefined'){
          getPath($scope.src, $scope.dest).then(function(floorNum){
            drawDirections($scope.srcNode._data.building_code, floorNum);
          });
        }
      });
    }
  };

  $scope.showSelect = true;
  var overlay;

  // Hit the backend to request a list of all available buildings on campus, sorted.
  $.get('/api/buildings', function(obj){
    $scope.masterBuildings = JSON.parse(obj);
    $.each(Object.keys($scope.masterBuildings).sort(), function (idx, val) {
      // Append each value to the dropdown.
      $("#buildingsInUW").append('<option value="' + val + '">' + val + ' - ' + $scope.masterBuildings[val].name + '</option>');
    });
    // Call Chosen jQuery library for styling and searchability.
    $("#buildingsInUW").chosen({ width: "95%" });
  });

  // When the user picks an option from the building dropdown, do the following.
  $( "#buildingsInUW" ).change(function() {
    // Zoom to the chosen building.
    $scope.build = $("#buildingsInUW option:selected").val();
    $scope.map.center = {latitude: $scope.masterBuildings[$scope.build].coordinates[1], longitude: $scope.masterBuildings[$scope.build].coordinates[0]};
    $scope.map.zoom = 19;
    $scope.showSelect = false;

    // If we have the building floor plans, map the floor plan overlay.
    if($scope.build == "RCH" || $scope.build == "E2"){
      if($scope.build == "RCH"){
        $scope.floorNum = 2;
        $scope.map.zoom = 20;
        // 2nd floor
        var swBound = new google.maps.LatLng(43.469956511113, -80.54128386508188);
        var neBound = new google.maps.LatLng(43.47063996900324, -80.5402374146804);

        var bounds = new google.maps.LatLngBounds(swBound, neBound);
        var srcImage = 'images/Waterloo Floor Plans/final/RCH2_CAD.png';

        DebugOverlay.prototype = new google.maps.OverlayView();
        $scope.overlay = new DebugOverlay(bounds, srcImage, $scope.map);
      }

      if($scope.build == "E2"){
        $scope.floorNum = 1;
        $scope.map.zoom = 19;
        // 1st floor
        var swBound = new google.maps.LatLng(43.46968368478908, -80.54181125662228);
        var neBound = new google.maps.LatLng(43.472067954481304, -80.53893026487356);

        var bounds = new google.maps.LatLngBounds(swBound, neBound);
        var srcImage = 'images/Waterloo Floor Plans/final/E2_1CAD.png';

        DebugOverlay.prototype = new google.maps.OverlayView();
        $scope.overlay = new DebugOverlay(bounds, srcImage, $scope.map);
      }

      // Overlay code modified from Google Maps, I believe.
      function DebugOverlay(bounds, image, map) {
        this.bounds_ = bounds;
        this.image_ = image;
        this.map_ = map;
        this.div_ = null;
        this.setMap(map.control.getGMap());
      }

      DebugOverlay.prototype.onAdd = function() {
        var div = document.createElement('div');
        div.style.borderStyle = 'none';
        div.style.borderWidth = '0px';
        div.style.position = 'absolute';
        var img = document.createElement('img');
        img.src = this.image_;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.opacity = '0.95';
        img.style.position = 'absolute';
        div.appendChild(img);
        this.div_ = div;
        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);
      };

      DebugOverlay.prototype.draw = function() {
        var overlayProjection = this.getProjection();
        var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
        var div = this.div_;
        div.style.left = sw.x + 'px';
        div.style.top = ne.y + 'px';
        div.style.width = (ne.x - sw.x) + 'px';
        div.style.height = (sw.y - ne.y) + 'px';
      };

      DebugOverlay.prototype.updateBounds = function(bounds){
        this.bounds_ = bounds;
        this.draw();
      };

      DebugOverlay.prototype.onRemove = function() {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
      };

      // Hit the backend to get a list of all available rooms in the graph.
      // This is to populate the dropdown for the search locations.
      $.get('/api/graph/rooms/', function(obj){
        var count = 0;
        var destAppendage; var srcAppendage; var build; var buildOG;

        // If something is returned,
        if(obj != ''){
          // Turn off the loading screen by setting showSelect to true.
          $scope.showSelect = true;
          $.each(JSON.parse(obj), function (idx, val) {
            // On the first iteration, set original to match the regex expression for building code.
            if(build == undefined){
              buildOG = val.match(/(\w*)\s/)[1];
            }
            else{
              buildOG = build;
            }
            var countOG = count;
            // Find space in value returned, and take the first number of it (which is the floor number).
            count = parseInt(val.charAt(val.indexOf(" ") + 1));
            build = val.match(/(\w*)\s/)[1];
            // We skip all of DC because we have not yet mapped all the edges and nodes for it.
            if(build != "DC" && build != "E5"){
              // Only want the specific starting location building to be provided for src locations.
              if(build == $scope.build){
                // If the floor number has changed or the building has changed,
                if (count > countOG || build != buildOG) {
                  // Append a new optgroup if previous floor was not 0. We're skipping basement nodes.
                  if(countOG != 0){
                    destAppendage+='</optgroup>';
                    srcAppendage+='</optgroup>';
                    $("#roomSrc").append(srcAppendage);
                    $("#roomDest").append(destAppendage);
                  }
                  // Create new optgroup labels for clarity.
                  destAppendage = '<optgroup label="' + build + ' Floor ' + count + '">';
                  srcAppendage = '<optgroup label="' + build + ' Floor ' + count + '">';
                }
                // Append value.
                destAppendage+='<option value="' + val + '">' + val + '</option>';
                srcAppendage+='<option value="' + val + '">' + val + '</option>';
              }
              else{
                // Otherwise, only append values to the dest location.
                if (count > countOG || build != buildOG) {
                  if(countOG != 0){
                    destAppendage+='</optgroup>';
                    $("#roomDest").append(destAppendage);
                  }
                  destAppendage = '<optgroup label="' + build + ' Floor ' + count + '">';
                }
                destAppendage+='<option value="' + val + '">' + val + '</option>';
              }
            }
          });
          //Closing off the iteration by closing the optgroup tag and then appending all to elements.
          destAppendage+='</optgroup>';
          srcAppendage+='</optgroup>';
          $("#roomSrc").append(srcAppendage);
          $("#roomDest").append(destAppendage);

          // Call chosen library and trigger update.
          $("#roomSrc").chosen({ width: "50%" });
          $("#roomDest").chosen({ width: "50%" });
          $(".chosen-select").val('').trigger("chosen:updated");
        }
      });
    }
    // Otherwise, tell the user there are no data points and then give them the option of restarting.
    else{
      $("#loadMessage").text("We have no data points here. Sorry!");
      $scope.load = true;
    }
    $timeout(function() {
      $scope.$apply();
    },0);
  })

  // Wipe out all the persisted data and let the user try again.
  $scope.restart = function(){
    // Remove any overlays or polylines that exist.
    if($scope.flightPath != undefined){
      $.each($scope.flightPath, function(i){
        $scope.flightPath[i].setMap(null);
      });
      $scope.distance = undefined;
    }
    $scope.build = undefined;
    $scope.collapsed = true;
    $scope.distDisplay = undefined;
    $scope.l1Dets = undefined;
    $scope.l2Dets = undefined;
    // Needed to wipe out old rooms from previous buildings
    $("#roomSrc").empty();
    $scope.src = undefined;
    $scope.dest = undefined;
    $scope.srcNode = undefined;
    $scope.destNode = undefined;
    $scope.waypts = undefined;
    $scope.overlay.setMap(null);
    $scope.transitOn = false;
    $scope.map.center = {latitude: 43.4722854, longitude: -80.5448576};
    $scope.map.zoom = 15;
    $scope.map.markers = [];
    $(".chosen-select").val('').trigger("chosen:updated");
  }

  // Special restart message if no data is available.
  $scope.retryOnFail = function(){
    $scope.build = undefined;
    $scope.map.center = {latitude: 43.4722854, longitude: -80.5448576};
    $scope.map.zoom = 15;
    $(".chosen-select").val('').trigger("chosen:updated");
    $scope.load = false;
    $("#loadMessage").text("Loading ...");
  }

  // If the source location is selected, plot the point on the map.
  $( "#roomSrc" ).change(function() {
    $scope.src = $("#roomSrc option:selected").val();
    plot("src").then(function(resp){
      // Provide details of that room in the side bar.
      if(resp._data.utility.length <= 0 && resp._data.name == ""){$scope.l1Dets = "Room";}
      else if(resp._data.name != ""){$scope.l1Dets = resp._data.name;}
      else {$scope.l1Dets = resp._data.utility.toString().replace(/,/g, ', ');}
      // If both dest and src are defined, get the path and then draw the directions.
      if(typeof $scope.src !== 'undefined' && typeof $scope.dest !== 'undefined'){
        getPath($scope.src, $scope.dest).then(function(floorNum){
          drawDirections($scope.srcNode._data.building_code, floorNum);
        });
      }
    });
  });

  // Same idea as above.
  $( "#roomDest" ).change(function() {
    $scope.dest = $("#roomDest option:selected").val();
    plot("dest").then(function(resp){
      if(resp._data.utility.length <= 0){$scope.l2Dets = "Room";}
      else if(resp._data.name != ""){$scope.l2Dets = resp._data.name;}
      else {$scope.l2Dets = resp._data.utility.toString().replace(/,/g, ', ');}
      if(typeof $scope.src !== 'undefined' && typeof $scope.dest !== 'undefined'){
        getPath($scope.src, $scope.dest).then(function(floorNum){
          drawDirections($scope.srcNode._data.building_code, floorNum);
        });
      }
    });
  })

  // Plotting function makes use of Promises as the process is Asynchronous and
  // will not finish processing before the value is required.
  var plot = function(node) {
    return $q(function(resolve){
      var map = $scope.map;
      var mark = $scope.map.markers;
      var options = {};
      if (node == "src"){
        RoomService.getID($scope.src.replace(/\s+/g, '')).then(function(result){
          $scope.srcNode = result;
          for(var i = 0; i < mark.length; i++) {
            // remove src marker from before. Ensure only one available.
            if (mark[i].id == 0) {
              mark.splice(i, 1);
              break;
            }
          }
          mark.push({
            id: 0,
            coords: {
              latitude: $scope.srcNode._y,
              longitude: $scope.srcNode._x
            },
            name: $scope.src,
            options: options,
            icon: {url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', scaledSize: new google.maps.Size(40,40)}
          });
          // Change floor to match the source node always.
          $scope.floor($scope.build, $scope.srcNode._z);
          resolve($scope.srcNode);
        })
      }
      else if (node == "dest") {
        RoomService.getID($scope.dest.replace(/\s+/g, '')).then(function(result){
          $scope.destNode = result;
          for(var i = 0; i < mark.length; i++) {
            if (mark[i].id == 1) {
              mark.splice(i, 1);
              break;
            }
          }
          // If dest node is not on the same floor as src node, change opacity.
          if ($scope.destNode != $scope.floorNum){
            options = {'opacity':0.6};
          }
          // http://uxrepo.com/static/icon-sets/font-awesome/svg/circle-empty.svg
          mark.push({
            id: 1,
            coords: {
              latitude: $scope.destNode._y,
              longitude: $scope.destNode._x
            },
            name: $scope.dest,
            options: options
          });
          // Always redraw the floor to align with the source node. That's where
          // the user will be starting, for clarity.
          if($scope.srcNode != undefined){
            $scope.floor($scope.build, $scope.srcNode._z);
          }
          resolve($scope.destNode);
        })
      }
    })
  };

  // GetPath calls the A* algorithm from the backend and uses Promises.
  var getPath = function(src, sink) {
    return $q(function(resolve){
      // instantiate google map objects for directions
      var waypts = {};
      // Set options for A* here.
      var handicap = "none";
      if($scope.stairs){
        handicap = "stairs";
      }
      if($scope.elevator){
        handicap = "elevators";
      }
      // A* output is one continuous path of markers.
      // On the frontend, this is parsed into multiple arrays of paths dependent
      // on building location, floor number.
      $.get('/api/astar/' + src.replace(/\s+/g, '') +'/'+ sink.replace(/\s+/g, '') + '/' + handicap, function(obj){
        var leng = obj.length;
        var start; var pathTemp; var pathNum; var tempNum; var buildId;
        var waypts = [];
        $.each(obj, function (idx, val) {
          // For the last object, finish by setting the distance in time and
          // then pushing the last path of points.
          if(idx == (leng-1)) {
            // https://en.wikipedia.org/wiki/Preferred_walking_speed to convert to time. Make them slower.
            // How to display to user:
            $scope.distance = (val.dist / 1.1).toFixed(2);
            $scope.distDisplay = "Time: " + $scope.distance + " s.";
            if($scope.distance >= 60){
              $scope.distDisplay = "Time: " + ($scope.distance/60).toFixed(2) + " min.";
            }
            if($scope.distance >= 3600){
              $scope.distDisplay = "Time: " + ($scope.distance/3600).toFixed(2) + " hr.";
            }
            waypts.push({alt: pathNum, buildId: buildId, path: pathTemp});
            $scope.waypts = waypts;
            resolve(start);
          }
          else{
            if(val.id.substr(0,3) == "RCH"){
              tempNum = parseInt(val.id[3]);
              if(pathNum == undefined){
                start = val.id[3];
                pathTemp = [];
                pathNum = tempNum;
              }
              if(tempNum != pathNum){
                waypts.push({alt: pathNum, buildId: buildId, path: pathTemp});
                // restart for next iteration
                pathTemp = [];
                pathTemp.push({lat: val.latitude, lng: val.longitude});
              }
              else{
                pathTemp.push({lat: val.latitude, lng: val.longitude});
              }
              buildId = "RCH";
              pathNum = tempNum;
            }
            if(val.id.substr(0,2) == "E2"){
              tempNum = parseInt(val.id[2]);
              if(pathNum == undefined){
                start = val.id[2];
                pathTemp = [];
                pathNum = tempNum;
              }
              if(tempNum != pathNum){
                waypts.push({alt: pathNum, buildId: buildId, path: pathTemp});
                // restart for next iteration
                pathTemp = [];
                pathTemp.push({lat: val.latitude, lng: val.longitude});
              }
              else{pathTemp.push({lat: val.latitude, lng: val.longitude});}
              pathNum = tempNum;
              buildId = "E2";
            }
            else{pathTemp.push({lat: val.latitude, lng: val.longitude});}
          }
        })
      })
    })
  };

  // Function drawDirections uses Promises and draws the specific directions
  // for the desired building and floor.
  var drawDirections = function(targetBuild, floor){
    return $q(function(resolve){
      $scope.transitOn = false;
      var mark = $scope.map.markers;

      // To purge the extra markers! There should only be one transition marker.
      while(mark.length > 2){
        for(var i = 0; i <= mark.length; i++) {
          // remove src and any stair markers
          if (mark[i].id != 0 && mark[i].id != 1) {
            mark.splice(i, 1);
            break;
          }
        }
      }

      // Clear previous flight path if it wasn't already.
      if($scope.flightPath != undefined){
        $.each($scope.flightPath, function(i){
          $scope.flightPath[i].setMap(null);
        });
      }
      $scope.flightPath = [];
      var path; var building; var newTarget; var content;
      var pointer = 0;
      var options = {};

      // Function to use promises to close the info window first before loading
      // another one. Keeps to only having one correct info window at all times.
      var closeFirst = function(){
        return $q(function(resolve){
          $scope.transitOn = false;
          resolve();
        })
      }

      // For each path array in waypts.
      for (var i in $scope.waypts) {
        path = $scope.waypts[i].path;
        // If path is the same floor and the same desired building, use 1 opacity.
        if($scope.waypts[i].alt == floor && $scope.waypts[i].buildId == targetBuild){
          var lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
            strokeOpacity: 1,
            scale: 1.5
          };

          pointer = parseInt(i) + 1;
          // Check if there's another path after this.
          if($scope.waypts[pointer] == undefined){
            var counterOff = true;
            // While counter is going:
            while(counterOff){
              for(var j = 0; j < mark.length; j++) {
                // Leave a note on the destination marker!
                // If we've reached the destination with multiple paths,
                // Give the option for the user to restart.
                if (mark[j].id == 1 && $scope.waypts.length > 1) {
                  content = "Click on me to restart route.";
                  mark[j].content = content;
                  mark[j].events = {
                    click: function () {
                      closeFirst().then(function(){
                        $scope.floor($scope.waypts[0].buildId, $scope.waypts[0].alt);
                      })
                    }
                  }
                  $scope.transition = mark[j];
                  $scope.infoContent = mark[j].content;
                  $scope.transitOn = true;
                  counterOff = false;
                }
                // Otherwise, remove extra marker icon for stairs/transitions.
                else if (mark[j].id == 1000){
                  mark.splice(j, 1);
                }
                // If only one floor, one path, don't push info window and just close.
                else if(mark[j].id == 1){
                  counterOff = false;
                }
              }
            }
          }
          // Else, plan for the next path by setting options for a transition marker.
          else{building = $scope.waypts[pointer].buildId; pointer = $scope.waypts[pointer].alt; options = {animation: google.maps.Animation.DROP};}
        }
        else{
          var lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
            strokeOpacity: 0.4,
            scale: 1.5
          };
        }
        // If there are multiple levels/buildings in this route.
        if(i > 0){
          // in order to have continuity from the last point.
          path.unshift($scope.waypts[i-1].path[$scope.waypts[i-1].path.length - 1]);
          var switchFloormarker = $scope.waypts[i-1].path[$scope.waypts[i-1].path.length - 1];
          $scope.transitOn = true;
          // If the transition is not between floors but between buildings.
          if($scope.waypts[parseInt(i) - 1].alt == floor){
            if(building != $scope.waypts[i-1].buildId){
              // If we're going to floor 0, say we're going down.
              if($scope.waypts[i].alt == 0){
                content = "Click me. Going underground to " + building + "."
              }
              // OW, say we're going outside.
              else{
                content = "Click me. Going outside to " + building + ".";
              }
            }
            // If it's a different floor that we're going on,
            else{
              // Say we're going up if we are.
              if($scope.waypts[i].alt > floor){
                content = "Click me. Going up to floor " + $scope.waypts[i].alt + ".";
              }
              // OW, down.
              else if($scope.waypts[i].alt < floor){
                content = "Click me. Going down to floor " + $scope.waypts[i].alt + ".";
              }
            }

            // Transition marker is here, with special icon and function.
            newTarget = {
              id: 1000,
              coords: {latitude: switchFloormarker.lat, longitude: switchFloormarker.lng},
              icon: {url: 'http://www.unav.ca/images/icons/circle-outline-xxl.png', scaledSize: new google.maps.Size(20,20)},
              options: options,
              content: content,
              events: {
                click: function () {
                  closeFirst().then(function(){
                    // Transition floors/buildings on click.
                    $scope.floor(building, pointer);
                  })
                }
              }
            }

            $scope.transition = newTarget;
            $scope.infoContent = newTarget.content;
            mark.push(newTarget);
          }

          $timeout(function() {
            $scope.$apply();
          },0);
        }
        // Draw polyline for the route of this path from $scope.waypts[i].
        $scope.flightPath.push(new google.maps.Polyline({
          map: $scope.map.control.getGMap(),
          icons: [{
            icon: lineSymbol,
            offset: '100%',
            repeat: '10px'
          }],
          path: path,
          strokeOpacity: 0,
          strokeColor: '#FF0000',
        }));

        // Animate the line if we're on the desired floor and building.
        if(floor == $scope.waypts[i].alt && targetBuild == $scope.waypts[i].buildId){
          animateLine($scope.flightPath[i]);
        }
      }
      $scope.collapsed = false;
      resolve();
    })
  }

  // Promise as timing is an issue. Animate the line by dividing the offset by 2.
  // Makes it look like the arrows are actually going forward when they're not.
  // Store the interval in a scope variable, so that it can be stopped later.
  var animateLine = function(line){
    return $q(function(resolve){
      var count = 0;
      $scope.flashingAnima = window.setInterval(function() {
        count = (count + 1) % 200;
        // Always animate the flightPath for the one that you're on.
        var icons = line.get('icons');
        icons[0].offset = (count / 2) + '%';
        line.set('icons', icons);
      }, 80);
      resolve();
    })
  }

  // Used to change the floor and building.
  $scope.floor = function(build, num){
    var swBound; var neBound; var srcImage;
    if(build == "RCH"){
      if(num == 1){
        // 1st floor
        swBound = new google.maps.LatLng(43.469979383347734, -80.5412503374692);
        neBound = new google.maps.LatLng(43.47064580865753, -80.540254849039);
        srcImage = 'images/Waterloo Floor Plans/final/RCH1_CAD.png';
      }
      else if(num == 2){
        // 2nd floor
        swBound = new google.maps.LatLng(43.469956511113, -80.54128386508188);
        neBound = new google.maps.LatLng(43.47063996900324, -80.5402374146804);
        srcImage = 'images/Waterloo Floor Plans/final/RCH2_CAD.png';
      }
      else if(num == 3){
        // 3rd floor
        swBound = new google.maps.LatLng(43.46993704537453, -80.54133616815767);
        neBound = new google.maps.LatLng(43.47064191555471, -80.5402374146804);
        srcImage = 'images/Waterloo Floor Plans/final/RCH3_CAD.png';
      }
    }
    if(build == "E2"){
      // Because we ignore floor 0, and group 0 and 1 together.
      if(num >= 0){
        // 1st floor
        swBound = new google.maps.LatLng(43.46968368478908, -80.54181125662228);
        neBound = new google.maps.LatLng(43.472067954481304, -80.53893026487356);
        srcImage = 'images/Waterloo Floor Plans/final/E2_1CAD.png';
      }
    }

    var bounds = new google.maps.LatLngBounds(swBound, neBound);

    DebugOverlay.prototype = new google.maps.OverlayView();
    $scope.overlay.setMap(null);
    $scope.overlay = new DebugOverlay(bounds, srcImage, $scope.map);

    //If src is not on the desired floor, change the opacity. OW, make it 1.
    if($scope.srcNode != undefined){
      if($scope.srcNode._z != num){$scope.map.markers[1].options = {'opacity': 0.6};}
      else{$scope.map.markers[1].options = {'opacity': 1.0}}
    }
    //If dest is not on the desired floor, change the opacity. OW, make it 1.
    if($scope.destNode != undefined){
      if($scope.destNode._z != num){$scope.map.markers[0].options = {'opacity': 0.6};}
      else{$scope.map.markers[0].options = {'opacity': 1.0}}
    }
    // Stop animating the polyline when no longer on the desired floor.
    if($scope.waypts != undefined){
      if($scope.waypts[1] != undefined)
      {
        if($scope.waypts[1].alt != num){
          clearInterval($scope.flashingAnima);
        }
      }
    }
    // This is used to change the floors after the map has been plotted.
    drawDirections(build, num);

    function DebugOverlay(bounds, image, map) {
      this.bounds_ = bounds;
      this.image_ = image;
      this.map_ = map;
      this.div_ = null;
      this.setMap(map.control.getGMap());
    }

    DebugOverlay.prototype.onAdd = function() {

      var div = document.createElement('div');
      div.style.borderStyle = 'none';
      div.style.borderWidth = '0px';
      div.style.position = 'absolute';
      var img = document.createElement('img');
      img.src = this.image_;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.opacity = '0.95';
      img.style.position = 'absolute';
      div.appendChild(img);
      this.div_ = div;
      var panes = this.getPanes();
      panes.overlayLayer.appendChild(div);
    };

    DebugOverlay.prototype.draw = function() {
      var overlayProjection = this.getProjection();
      var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
      var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
      var div = this.div_;
      div.style.left = sw.x + 'px';
      div.style.top = ne.y + 'px';
      div.style.width = (ne.x - sw.x) + 'px';
      div.style.height = (sw.y - ne.y) + 'px';
    };

    DebugOverlay.prototype.updateBounds = function(bounds){
      this.bounds_ = bounds;
      this.draw();
    };

    DebugOverlay.prototype.onRemove = function() {
      this.div_.parentNode.removeChild(this.div_);
      this.div_ = null;
    };
  };

  // Flip Sidebar function is used to toggle the details on the RHS of nav page.
  $scope.flipSidebar = function () {
    //If DIV is hidden it will be visible and vice versa.
    if(!$scope.collapsed){
      $("#searchButton").text(" Show Details");
      $("#searchButton").removeClass("glyphicon-chevron-right");
      $("#searchButton").addClass("glyphicon-chevron-left");
    }
    else{
      $("#searchButton").text(" Hide Details");
      $("#searchButton").removeClass("glyphicon-chevron-left");
      $("#searchButton").addClass("glyphicon-chevron-right");
    }
    $scope.collapsed = !$scope.collapsed;
  };
});

// Near you Controller.
uNav.controller('nearyouController', function($scope, $document, $q, $timeout, $anchorScroll, $location, uiGmapIsReady) {

  // Check for geolocation.
  $scope.geolocationAvailable = navigator.geolocation ? true : false;

  $scope.flipSidebar = function () {
    //If DIV is hidden it will be visible and vice versa.
    if($scope.collapsed){
      $("#sidebar").text(" Show Amenities");
      $("#sidebar").removeClass("glyphicon-chevron-right");
      $("#sidebar").addClass("glyphicon-chevron-left");
    }
    else{
      $("#sidebar").text(" Hide Amenities");
      $("#sidebar").removeClass("glyphicon-chevron-left");
      $("#sidebar").addClass("glyphicon-chevron-right");
    }
    $scope.collapsed = !$scope.collapsed;
  };

  // UI snappishness.
  $scope.scrollTo=function(id){
    $location.hash(id);
    $anchorScroll();
  }

  // Provided a utility, show the specific markers corresponding to the data.
  $scope.chose = function(util){
    $scope.util = util;
    if($scope.windowOptions.show){$scope.windowOptions.show = undefined;}
    var temp = {};
    var mark = $scope.map.markers;
    mark = [];
    geoLocate($scope.naviOn).then(loadMarkers(util).then(function(){
      $scope.naviOn = true;
      $scope.collapsed = true;
    }));
  };

  // Use promise for this function. Locate user and plot their position.
  var geoLocate = function(navi){
    return $q(function(resolve){
      if ($scope.geolocationAvailable) {
        navigator.geolocation.getCurrentPosition(function (position) {
          if(navi == undefined){
            $scope.map.center = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            $scope.map.zoom = 19;
          }

          // Show bouncing blue happiness for the user's location.
          $scope.map.markers.push({
            id: 9000,
            coords: {latitude: position.coords.latitude, longitude: position.coords.longitude},
            icon: {url: 'http://www.unav.ca/images/icons/circle-xxl.png', scaledSize: new google.maps.Size(20,20)},
            options: {animation: google.maps.Animation.BOUNCE}
          });
          resolve();
        });
      }
    })
  }

  // Use of promises to load markers. Hitting backend for list of amenities.
  var loadMarkers = function(util){
    return $q(function(resolve){
      $.get('/api/graph/amenities/' + util, function(result){
        $scope.map.markers = [];
        var labelContent = {};
        var input;
        $.each(JSON.parse(result), function(idx, val){
          if(val._data.utility.indexOf("WC-W") > -1){
            util = "WC-W";
          }
          if(val._data.utility.indexOf("WC-M") > -1){
            util = "WC-M";
          }
          // Use of switch to have different icons based on what utilities are requested.
          switch (util) {
            case "WC":
            labelContent = '<i class="fa fa-2x fa-female text-primary"></i><i class="fa fa-2x fa-male text-primary"></i>';
            break;
            case "WC-W":
            labelContent = '<i class="fa fa-2x fa-female text-primary"></i>';
            break;
            case "WC-M":
            labelContent = '<i class="fa fa-2x fa-male text-primary"></i>';
            break;
            case "Food":
            labelContent = '<i class="fa fa-2x fa-coffee text-primary"></i>';
            break;
            case "Ramp":
            labelContent = '<i class="fa fa-2x fa-wheelchair text-primary"></i>';
            break;
            case "Fountain":
            labelContent = '<i class="fa fa-2x fa fa-tint text-primary"></i>';
            break;
            case "Stairs":
            labelContent = '<i class="fa fa-2x fa-sort-amount-asc text-primary"></i>';
            break;
            case "Elevator":
            labelContent = '<i class="fa fa-2x fa-toggle-down text-primary"></i>';
            break;
            case "Exit":
            labelContent = '<i class="fa fa-2x fa-sign-out text-primary"></i>';
            break;
            case "Lab":
            labelContent = '<i class="fa fa-2x fa-laptop text-primary"</i>';
            break;
            case "Study":
            labelContent = '<i class="fa fa-2x fa-pencil text-primary"></i>';
            break;
          }
          // For the info label, if there's a name, use it in the popup.
          // If there isn't, insert the ID of the room.
          if(val._data.name != ""){
            input = val._data.name;
          }
          else{
            input = val._id;
          }
          // Must use a marker, so use a super tiny blank pixel and have icons via label.
          $scope.map.markers.push({
            id: idx,
            coords: {
              latitude: val._y,
              longitude: val._x
            },
            content: input,
            icon: {url: 'http://www.netdotart.com/statebirds/transparent.gif', scaledSize: new google.maps.Size(0,0)},
            options: {labelContent: labelContent}
          });
        });
        resolve();
      });
    })
  }

  $scope.windowOptions = {
    visible: false
  };

  // click action for markers. Don't show anything if you're the geolocated spot.
  // OW, display info content, but there can only be one.
  $scope.onClick = function(e){
    if(e.m.id != 9000){
      if($scope.windowOptions.show == undefined){
        $scope.windowOptions.show = !$scope.windowOptions.show;
      }
      $scope.selectedMarker = e.m;
      var temp = e.m.content;
      if(/\w*[A-Z]\d$/.test(temp)){temp = temp.slice(0, -2)}
      if(/\w*[A-Z]$/.test(temp)){temp = temp.slice(0, -1)}

      $scope.infoContent = temp;
      $timeout(function() {
        $scope.$apply();
      },0);
    }
  }

  $scope.closeClick = function() {
    $scope.windowOptions.visible = false;
  };

  // UI stylesss.
  $("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("wrapper").toggleClass("active");
  });

  /*Scroll Spy*/
  $('body').scrollspy({ target: '#spy', offset:80});
});

// Factory service to hit backend for list of a specific room and it's details.
uNav.factory('RoomService', function($q, $timeout, $http) {
  return {
    getID: function(id){
      return $http.get('/api/graph/rooms/' + id)
      .then(function(response) {
        if (typeof response.data === 'object') {
          return response.data;
        } else {
          // invalid response
          return $q.reject(response.data);
        }
      }, function(response){
        return $q.reject(response.data);
      });
    }
  }
});

// Contact controller used to return e-mails.
uNav.controller('contactController', function ($scope, $http){

  $scope.sendMail = function () {
    var data = ({
      contactName : $scope.contactName,
      contactEmail : $scope.contactEmail,
      contactReason : $scope.contactReason,
      contactMsg : $scope.contactMsg
    });
    // Simple POST request example (passing data) :
    $http.post('/api/contact-form', data).
    success(function(data, status, headers, config) {
      alert('Thanks for your message, ' + data.contactName + '. You Rock!');
    });
  }
})
