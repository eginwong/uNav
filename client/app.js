var uNav = angular.module('uNav', ['ui', 'ui.utils', 'ngRoute', 'ui.bootstrap', 'uiGmapgoogle-maps', 'ngResource']).
config(function($routeProvider, $locationProvider, uiGmapGoogleMapApiProvider) {
  $locationProvider.hashPrefix('');
  $routeProvider.
  when('/', { templateUrl : 'app/partials/home.html', controller  : 'mainController'}).
  when('/navigate', {templateUrl : 'app/partials/navigate.html', controller  : 'navigateController'}).
  when('/nearyou', { templateUrl : 'app/partials/nearyou.html', controller  : 'nearyouController'}).
  when('/about', { templateUrl : 'app/partials/about.html'}).
  when('/contact', { templateUrl : 'app/partials/contact.html', controller : 'contactController'});

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

uNav.controller('navigateController', function($scope, $q, $timeout, $resource, $location, RoomService, uiGmapIsReady) {

  // To reset the map between routing.
  uiGmapIsReady.promise() // if no value is put in promise() it defaults to promise(1)
  .then(function (instances) {
    $scope.map.markers = [];
    $scope.map.center = {latitude: 43.4722854, longitude: -80.5448576};
    $scope.map.zoom = 15;
  })

  $scope.stairs = false;
  $scope.elevator = false;
  $scope.load = false;

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

    if($scope.dest != undefined){
      plot("dest").then(function(resp){
        if(resp._data.utility.length <= 0){$("#l2Details").text("Room");}
        else {$("#l2Details").text(resp._data.utility.toString().replace(/,/g, ', '));}
        if(typeof $scope.src !== 'undefined' && typeof $scope.dest !== 'undefined'){
          $scope.ShowHide("found");
          getPath($scope.src, $scope.dest).then(function(floorNum){
            drawDirections(floorNum);
          });
        }
      });
    }
  };

  $scope.showSelect = true;
  $scope.IsHidden = true;
  var overlay;

  $.get('/api/buildings', function(obj){
    $scope.masterBuildings = JSON.parse(obj);
    $.each(Object.keys($scope.masterBuildings).sort(), function (idx, val) {
      $("#buildingsInUW").append('<option value="' + val + '">' + val + ' - ' + $scope.masterBuildings[val].name + '</option>');
    });
    $("#buildingsInUW").chosen({ width: "95%" });
  });

  //This will hide the DIV by default.
  $scope.ShowHide = function (force) {
    //If DIV is hidden it will be visible and vice versa.
    var inputValue=$("#searchButton").attr('value');
    if(force == "found"){
      inputValue = "Expand";
      $scope.IsHidden = true;
    }
    else if(force == "reset"){
      inputValue = "Reduce";
      $scope.IsHidden = false;
    }
    else{}

    if(inputValue=="Expand")
    {
      $("#searchWrapper").animate({width:"1700px"});
      $("#searchButton").attr('value','Reduce');
      $("#searchButton").text(" Hide Details");
      $("#searchButton").removeClass("glyphicon-chevron-left");
      $("#searchButton").addClass("glyphicon-chevron-right");

    }
    else if(inputValue=="Reduce")
    {
      $("#searchWrapper").animate({width:"100%"});
      $("#searchButton").attr('value','Expand');
      $("#searchButton").text(" Show Details");
      $("#searchButton").removeClass("glyphicon-chevron-right");
      $("#searchButton").addClass("glyphicon-chevron-left");
    }
    $scope.IsHidden = $scope.IsHidden ? false : true;
  };

  $( "#buildingsInUW" ).change(function() {
    $scope.build = $("#buildingsInUW option:selected").val();
    $scope.map.center = {latitude: $scope.masterBuildings[$scope.build].coordinates[1], longitude: $scope.masterBuildings[$scope.build].coordinates[0]};
    $scope.map.zoom = 19;
    $scope.showSelect = false;

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

      $.get('/api/graph/rooms/', function(obj){
        var count = 0;
        var destAppendage;
        // Assuming the floor start at 1.
        var srcAppendage = '<optgroup label="' + $scope.build + ' Floor 1">';
        var build;
        var buildOG;
        if(obj != ''){
          $scope.showSelect = true;
          $.each(JSON.parse(obj), function (idx, val) {
            if(build == undefined){
              buildOG = val.match(/(\w*)\s/)[1];
            }
            else{
              buildOG = build;
            }
            var countOG = count;
            count = parseInt(val.charAt(val.indexOf(" ") + 1));
            build = val.match(/(\w*)\s/)[1];
            if(build != "DC"){
              if(build == $scope.build){
                if (count > countOG) {
                  if(countOG != 0){
                    destAppendage+='</optgroup>';
                    srcAppendage+='</optgroup>';
                    $("#roomSrc").append(srcAppendage);
                    $("#roomDest").append(destAppendage);
                  }
                  destAppendage = '<optgroup label="' + build + ' Floor ' + count + '">';
                  srcAppendage = '<optgroup label="' + build + ' Floor ' + count + '">';
                }
                destAppendage+='<option value="' + val + '">' + val + '</option>';
                srcAppendage+='<option value="' + val + '">' + val + '</option>';
              }
              else{
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
          //The last one.
          destAppendage+='</optgroup>';
          srcAppendage+='</optgroup>';
          $("#roomSrc").append(destAppendage);
          $("#roomDest").append(srcAppendage);

          $("#roomSrc").chosen({ width: "50%" });
          $("#roomDest").chosen({ width: "50%" });
        };
      });
    }
    else{
      $("#loadMessage").text("We have no data points here. Sorry!");
      $scope.load = true;
    }
    $timeout(function() {
      $scope.$apply();
    },0);
  });

  $scope.restart = function(){
    if($scope.flightPath != undefined){
      $.each($scope.flightPath, function(i){
        $scope.flightPath[i].setMap(null);
      });
      $scope.distance = undefined;
    }
    $scope.build = undefined;
    $scope.IsHidden = false;
    $scope.ShowHide("reset");
    $("#l1Details").empty();
    $("#l2Details").empty();
    $scope.src = undefined;
    $scope.dest = undefined;
    $scope.srcNode = undefined;
    $scope.destNode = undefined;
    $scope.waypts = undefined;
    $scope.overlay.setMap(null);
    $scope.map.center = {latitude: 43.4722854, longitude: -80.5448576};
    $scope.map.zoom = 15;
    $scope.map.markers = [];
    $(".chosen-select").val('').trigger("chosen:updated");
  }

  $scope.retryOnFail = function(){
    $scope.build = undefined;
    $scope.map.center = {latitude: 43.4722854, longitude: -80.5448576};
    $scope.map.zoom = 15;
    $(".chosen-select").val('').trigger("chosen:updated");
    $scope.load = false;
    $("#loadMessage").text("Loading ...");
  }

  $( "#roomSrc" ).change(function() {
    $scope.src = $("#roomSrc option:selected").val();
    plot("src").then(function(resp){
      if(resp._data.utility.length <= 0 && resp._data.name == ""){$("#l1Details").text("Room");}
      else if(resp._data.name != ""){$("#l1Details").text(resp._data.name);}
      else {$("#l1Details").text(resp._data.utility.toString().replace(/,/g, ', '));}
      if(typeof $scope.src !== 'undefined' && typeof $scope.dest !== 'undefined'){
        $scope.ShowHide("found");
        getPath($scope.src, $scope.dest).then(function(floorNum){
          drawDirections(floorNum);
        });
      }
    });
  });

  $( "#roomDest" ).change(function() {
    $scope.dest = $("#roomDest option:selected").val();
    plot("dest").then(function(resp){
      if(resp._data.utility.length <= 0){$("#l2Details").text("Room");}
      else if(resp._data.name != ""){$("#l2Details").text(resp._data.name);}
      else {$("#l2Details").text(resp._data.utility.toString().replace(/,/g, ', '));}
      if(typeof $scope.src !== 'undefined' && typeof $scope.dest !== 'undefined'){
        $scope.ShowHide("found");
        getPath($scope.src, $scope.dest).then(function(floorNum){
          drawDirections(floorNum);
        });
      }
    });
  })

  var plot = function(node) {
    return $q(function(resolve){
      var map = $scope.map;
      var mark = $scope.map.markers;
      var options = {};
      if (node == "src"){
        RoomService.getID($scope.src.replace(/\s+/g, '')).then(function(result){
          $scope.srcNode = result;
          for(var i = 0; i < mark.length; i++) {
            // remove src and any stair markers
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
          $scope.floor($scope.srcNode._z);
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
          if($scope.srcNode != undefined){
            $scope.floor($scope.srcNode._z);
          }
          resolve($scope.destNode);
        })
      }
    })
  };

  var getPath = function(src, sink) {
    return $q(function(resolve){
      // instantiate google map objects for directions
      var waypts = {};
      var handicap = "none";
      if($scope.stairs){
        handicap = "stairs";
      }
      if($scope.elevator){
        handicap = "elevators";
      }
      $.get('/api/astar/' + src.replace(/\s+/g, '') +'/'+ sink.replace(/\s+/g, '') + '/' + handicap, function(obj){
        var leng = obj.length;
        var start; var pathTemp; var pathNum; var tempNum;
        var waypts = [];
        $.each(obj, function (idx, val) {
          if(idx == (leng-1)) {
            // https://en.wikipedia.org/wiki/Preferred_walking_speed to convert to time.
            // How to display to user:
            $scope.distance = (val.dist / 1.4).toFixed(2);
            $("#distDisplay").text("Time: " + $scope.distance + " s.");
            if($scope.distance >= 60){
              $("#distDisplay").text("Time: " + ($scope.distance/60).toFixed(2) + " min.");
            }
            if($scope.distance >= 3600){
              $("#distDisplay").text("Time: " + ($scope.distance/3600).toFixed(2) + " hr.");
            }
            waypts.push({alt: pathNum, path: pathTemp});
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
                waypts.push({alt: pathNum, path: pathTemp});
                // restart for next iteration
                pathTemp = [];
                pathTemp.push({lat: val.latitude, lng: val.longitude});
              }
              else{
                pathTemp.push({lat: val.latitude, lng: val.longitude});
              }
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
                waypts.push({alt: pathNum, path: pathTemp});
                // restart for next iteration
                pathTemp = [];
                pathTemp.push({lat: val.latitude, lng: val.longitude});
              }
              else{
                pathTemp.push({lat: val.latitude, lng: val.longitude});
              }
              pathNum = tempNum;
            }
            else{pathTemp.push({lat: val.latitude, lng: val.longitude});}
          }
        })
      })
    })
  };

  var drawDirections = function(floor){
    return $q(function(resolve){
      var mark = $scope.map.markers;

      // To purge the extra markers!
      while(mark.length > 2){
        for(var i = 0; i <= mark.length; i++) {
          // remove src and any stair markers
          if (mark[i].id != 0 && mark[i].id != 1) {
            mark.splice(i, 1);
            break;
          }
        }
      }

      if($scope.flightPath != undefined){
        $.each($scope.flightPath, function(i){
          $scope.flightPath[i].setMap(null);
        });
      }
      $scope.flightPath = [];
      var path;
      for (var i in $scope.waypts) {
        path = $scope.waypts[i].path;
        if($scope.waypts[i].alt == floor){
          var lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
            strokeOpacity: 1,
            scale: 1.5
          };
        }
        else{
          var lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
            strokeOpacity: 0.4,
            scale: 1.5
          };
        }
        // in order to have continuity from the last point.
        if(i > 0){
          path.unshift($scope.waypts[i-1].path[$scope.waypts[i-1].path.length - 1]);
          var switchFloormarker = $scope.waypts[i-1].path[$scope.waypts[i-1].path.length - 1];

          //put in the button here.
          mark.push({
            id: 1000,
            coords: {latitude: switchFloormarker.lat, longitude: switchFloormarker.lng},
            icon: {url: 'http://www.wongwatch.com/images/icons/person-walk.png', scaledSize: new google.maps.Size(25,25)},
            options: {animation: google.maps.Animation.DROP}
          });
          $timeout(function() {
            $scope.$apply();
          },0);
        }
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

        // Figure out how we're going to change the floor function.
        if(floor == $scope.waypts[i].alt){
          animateLine($scope.flightPath[i]);
        }
      }
      resolve();
    })
  }

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

  $scope.floor = function(num){
    var swBound; var neBound; var srcImage;
    if($scope.build == "RCH"){
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
    if($scope.build == "E2"){
      if(num == 1){
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

    if($scope.srcNode != undefined){
      if($scope.srcNode._z != num){$scope.map.markers[0].options = {'opacity': 0.6};}
      else{$scope.map.markers[0].options = {'opacity': 1.0}}
    }
    if($scope.destNode != undefined){
      if($scope.destNode._z != num){$scope.map.markers[1].options = {'opacity': 0.6};}
      else{$scope.map.markers[1].options = {'opacity': 1.0}}
    }
    if($scope.waypts != undefined){
      if($scope.waypts[0].alt != num){
        clearInterval($scope.flashingAnima);
      }
    }
    // This is used to change the floors after the map has been plotted.
    // drawDirections(num);

    //OPTIMIZATION: Clean this up when you can make DebugOverlay global.
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
});

uNav.controller('nearyouController', function($scope, $document, $q, $timeout, $anchorScroll, $location, uiGmapIsReady) {

  $scope.geolocationAvailable = navigator.geolocation ? true : false;

  $scope.scrollTo=function(id){
    $location.hash(id);
    $anchorScroll();
  }

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

          $scope.map.markers.push({
            id: 9000,
            coords: {latitude: position.coords.latitude, longitude: position.coords.longitude},
            icon: {url: 'http://www.wongwatch.com/images/icons/circle-xxl.png', scaledSize: new google.maps.Size(20,20)},
            options: {animation: google.maps.Animation.BOUNCE}
          });
          resolve();
        });
      }
    })
  }

  // Add Async over here to load later
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
          if(val._data.name != ""){
            input = val._data.name;
          }
          else{
            input = val._id;
          }
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

  $("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("wrapper").toggleClass("active");
  });

  /*Scroll Spy*/
  $('body').scrollspy({ target: '#spy', offset:80});
});

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
