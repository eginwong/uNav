var uNav = angular.module('uNav', ['ui', 'ui.utils', 'ngRoute', 'ui.bootstrap', 'uiGmapgoogle-maps', 'ngResource']).
config(function($routeProvider, $locationProvider, uiGmapGoogleMapApiProvider) {
  $locationProvider.hashPrefix('');
  $routeProvider.
  when('/', { templateUrl : 'app/partials/home.html', controller  : 'mainController'}).
  when('/search', {templateUrl : 'app/partials/search.html', controller  : 'searchController'}).
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
      zoom: 16,
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

uNav.controller('searchController', function($scope, $q, $timeout, $resource, $location, RoomService, uiGmapIsReady, $route) {

  $('input.limit').on('change', function() {
      $('input.limit').not(this).prop('checked', false);
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
  });

  $scope.$on('$routeChangeSuccess', function() {
    if($scope.map != undefined){
      $scope.map.markers = [];
    }
  });
  $scope.showSelect = true;
  $scope.IsHidden = true;
  var overlay;

  $.get('/api/buildings', function(obj){
    $scope.masterBuildings = JSON.parse(obj);
    $.each($scope.masterBuildings, function (idx, val) {
      $("#buildingsInUW").append('<option value="' + idx + '">' + idx + ' - ' + val.name + '</option>');
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
    }
    else if(inputValue=="Reduce")
    {
      $("#searchWrapper").animate({width:"100%"});
      $("#searchButton").attr('value','Expand');
    }
    $scope.IsHidden = $scope.IsHidden ? false : true;
  };

  $( "#buildingsInUW" ).change(function() {
    $scope.build = $("#buildingsInUW option:selected").val();
    $scope.map.center = {latitude: $scope.masterBuildings[$scope.build].coordinates[1], longitude: $scope.masterBuildings[$scope.build].coordinates[0]};
    $scope.map.zoom = 19;
    $scope.showSelect = false;

    if($scope.build == "RCH"){
      $scope.floorNum = 2;
      $scope.map.zoom = 20;
      // 2nd floor
      var swBound = new google.maps.LatLng(43.469956511113, -80.54128386508188);
      var neBound = new google.maps.LatLng(43.47063996900324, -80.5402374146804);

      var bounds = new google.maps.LatLngBounds(swBound, neBound);
      var srcImage = 'images/Waterloo Floor Plans/RCH2_CAD.png';

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

    $.get('/api/graph/rooms/select/' + $scope.build, function(obj){
      var count = 0;
      var appendage;
      if(obj != ''){
        $scope.showSelect = true;
        $.each(JSON.parse(obj), function (idx, val) {
          var countOG = count;
          count = parseInt(val.charAt(val.indexOf(" ") + 1));
          if (count > countOG) {
            if(countOG != 0){
              appendage+='</optgroup>';
              $("#roomSrc").append(appendage);
              $("#roomDest").append(appendage);
            }
            appendage = '<optgroup label="' + $scope.build + ' Floor ' + count + '">';
          }
          appendage+='<option value="' + val + '">' + val + '</option>';
        });
        //The last one.
        appendage+='</optgroup>';
        $("#roomSrc").append(appendage);
        $("#roomDest").append(appendage);

        $("#roomSrc").chosen({ width: "10%" });
        $("#roomDest").chosen({ width: "10%" });
      };
      $timeout(function() {
        $scope.$apply();
      },0);
    });
  });

  $scope.restart = function(){
    $scope.floor(2);
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
    $scope.map.zoom = 16;
    $scope.map.markers = [];
    $(".chosen-select").val('').trigger("chosen:updated");
  }

  $( "#roomSrc" ).change(function() {
    $scope.src = $("#roomSrc option:selected").val();
    plot("src").then(function(resp){
      if(resp._data.utility.length <= 0){$("#l1Details").text("Room");}
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
      if($("#stairSearch").is(":checked")){
        handicap = "stairs";
      }
      if($("#elevatorSearch").is(":checked")){
        handicap = "elevators";
      }
      $.get('/api/astar/' + src.replace(/\s+/g, '') +'/'+ sink.replace(/\s+/g, '') + '/' + handicap, function(obj){
        var leng = obj.length;
        var start; var pathTemp; var pathNum; var tempNum;
        var waypts = [];
        $.each(obj, function (idx, val) {
          if(idx == (leng-1)) {
            // https://en.wikipedia.org/wiki/Preferred_walking_speed to convert to time.
            $scope.distance = (val.dist / 1.4).toFixed(2);
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
            else{pathTemp.push({lat: val.latitude, lng: val.longitude});}
          }
        })
      })
    })
  };

  var drawDirections = function(floor){
    return $q(function(resolve){
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
    $("#floor1").removeClass("btn-primary disabled");
    $("#floor2").removeClass("btn-primary disabled");
    $("#floor3").removeClass("btn-primary disabled");
    $("#floor" + num).addClass("btn-primary disabled");
    if(num == 1 && $scope.build == "RCH"){
      // 1st floor
      swBound = new google.maps.LatLng(43.469979383347734, -80.5412503374692);
      neBound = new google.maps.LatLng(43.47064580865753, -80.540254849039);
      srcImage = 'images/Waterloo Floor Plans/RCH1_CAD.png';
    }
    else if(num == 2 && $scope.build == "RCH"){
      // 2nd floor
      swBound = new google.maps.LatLng(43.469956511113, -80.54128386508188);
      neBound = new google.maps.LatLng(43.47063996900324, -80.5402374146804);
      srcImage = 'images/Waterloo Floor Plans/RCH2_CAD.png';
    }
    else if(num == 3 && $scope.build == "RCH"){
      // 3rd floor
      swBound = new google.maps.LatLng(43.46993704537453, -80.54133616815767);
      neBound = new google.maps.LatLng(43.47064191555471, -80.5402374146804);
      srcImage = 'images/Waterloo Floor Plans/RCH3_CAD.png';
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
    drawDirections(num);

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

uNav.controller('nearyouController', function($scope, $q, $timeout, $anchorScroll, $location, uiGmapIsReady, $route) {
  $scope.$on('$routeChangeSuccess', function() {
    if($scope.map != undefined){
      $scope.map.markers = [];
    }
  });
  $scope.geolocationAvailable = navigator.geolocation ? true : false;
  uiGmapIsReady.promise() // if no value is put in promise() it defaults to promise(1)
  .then(function () {
    $scope.map.zoom = 19;
  })

  $scope.scrollTo=function(id){
    $location.hash(id);
    $anchorScroll();
  }

  $scope.chose = function(util){
    $scope.util = util;
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
        switch (util) {
          case "WC":
            labelContent = '<i class="fa fa-2x fa-female text-primary"></i><i class="fa fa-2x fa-male text-primary"></i>';
            break;
          case "Food":
            labelContent = '<i class="fa fa-2x fa-coffee text-primary"></i>';
            break;
          case "Access":
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
        }
        $.each(JSON.parse(result), function(idx, val){
          $scope.map.markers.push({
            id: idx,
            coords: {
              latitude: val._y,
              longitude: val._x
            },
            name: val._id,
            icon: {url: 'http://www.netdotart.com/statebirds/transparent.gif', scaledSize: new google.maps.Size(0,0)},
            options: {labelContent: labelContent}
          });
        });
        resolve();
      });
    })
  }

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
