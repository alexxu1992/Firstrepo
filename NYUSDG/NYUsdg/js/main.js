// JavaScript Document
var vHeight = $(window).height(),
    vWidth = $(window).width();

var app = angular.module("NYUsdg",['angularUtils.directives.dirPagination','smoothScroll','ngRoute']);

app.config(function(paginationTemplateProvider) {
    paginationTemplateProvider.setPath('js/dirPagination.tpl.html');
});

app.config(function($routeProvider) {
    $routeProvider

    // route for the home page
        .when('/', {
            templateUrl : 'template/main.html',
            controller  : 'MainController'
        })
        .when('/map/:idfilter', {
            templateUrl : 'template/map.html',
            controller  : 'MapController'
        })
        .when('/map', {
            templateUrl : 'template/map.html',
            controller  : 'MapController'
        })
        .otherwise({redirectTo:'/'});

});

// MainController
app.controller("MainController",
    function ($scope, $http){
        var cover = $('.cover');
        cover.css({"height":vHeight,"width":'100%'});
        $scope.method = 'GET';
        $scope.url = 'http://websys3.stern.nyu.edu:7003/';
        //$scope.url = 'http://207.182.130.30:7003/';
        // Initilize content using get
        $http({method: $scope.method, url: $scope.url + 'data/'}).
        then(function(response) {
            $scope.data = response.data;
        }, function(response) {
            alert(response.data);;
        });

        // Same as above but you can assign function to buttons -> ng-click="get()"
        $scope.get = function(){
            $http({method: $scope.method, url: $scope.url + 'data/'}).
            then(function(response) {
                $scope.data = response.data;
            }, function(response) {
                alert(response.data);;
            });
        };

        // Classify information using category field -> ng-click="classify(xxx)"
        $scope.classify = function(classifier){
            $http({method: $scope.method, url: $scope.url + 'data/' + classifier}).
            then(function(response) {
                $scope.data = response.data;
            }, function(response) {
                alert(response.data);;
            });
        };
        // Remove information using its MongoDB "id" field -> ng-click="remove(xxx)"
        $scope.remove = function(id){
            //alert(id);
            $http.delete($scope.url +'data/'+ id).
            then(function (response){
                if(response.data == '1'){
                    alert('Please login');
                    //$location.absUrl() = '/login.html';
                }
                else{$scope.data = response.data;}
            }, function (response){
                alert('Something Wrong with the Sever');
            });
        };


        // Inside data are in JSON format : {name : xxx}
        $scope.addNew = function(){
            var tmp = {};
            tmp.name = $scope.input_name;
            tmp.discount = $scope.input_discount + '%';
            tmp.requirement = $scope.input_requirement;
            tmp.info = $scope.input_info;
            tmp.web = $scope.input_web;
            tmp.logo = $scope.input_logo;
            tmp.lat = $scope.input_lat;
            tmp.lng = $scope.input_lng;
            tmp.location = $scope.input_location;
            tmp.phone = $scope.input_phone;
            $http.post($scope.url+'data/', tmp).
            then(function(response) {
                if(response.data == '1'){alert('Please login');}
                else{$scope.data = response.data;}
            }, function(response) {
                alert('Unknown Error');
            });
        };

        // Login function -> ng-click="login()"
        $scope.login = function(){
            var tmp = $scope.info;
            $http.post($scope.url+'login/', tmp).
            then(function(response) {
                alert(response.data);
                $location.path('/');
            }, function(response) {
                alert('Unknown Error');
            });
        };

        //To certain map mark
        $scope.toMap = function(id){
            window.location = ('#/map/'+id);
        }

        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.pagination = {
            current: 1
        };
        $scope.pageChangeHandler = function() {
        };

        $scope.toggle = function(s){
            window.location.replace(s);

        }

        $scope.setCurPos = function(){
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(pos) {
                    $scope.input_lat = pos.coords.latitude;
                    $scope.input_lng = pos.coords.longitude;
                });
            }
            else{
                alert("Geolocation is not supported or allowed by the browser");
            }
        }

    });

// MapController
app.controller('MapController', function($scope, $controller, $routeParams) {
    //$controller('MainController', {$scope: $scope}); //This works
    var idfilter = $routeParams.idfilter;
    var map;
    var myCenter;
    var nyuCenter;
    var infowindow;
    var centermarker;
    var markerMap = {};

    function initialize() {

        var mapcover = $('.mapcover');
        mapcover.css({"height":0.85*vHeight,"width":0.9*vWidth});

        nyuCenter=new google.maps.LatLng(40.731104,-73.994007);
        myCenter = nyuCenter;
        var mapProp = {
            center:myCenter,
            zoom:15,
            mapTypeId:google.maps.MapTypeId.ROADMAP,
            scaleControl:true,
        };

        map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
        var image = {
            url: 'images/bluebubble.png',
            // This marker is 20 pixels wide by 32 pixels high.
            size: new google.maps.Size(64, 64),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(0, 32),
            scaledSize: new google.maps.Size(45, 45)
        };
        //Center Marker
        centermarker = new google.maps.Marker({
            position: myCenter,
            icon: image
        });
        centermarker.setMap(map);


        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                myCenter = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
                if(!idfilter){
                    map.panTo(myCenter);
                    centermarker.setPosition(myCenter);
                }
            });
            navigator.geolocation.watchPosition(function (pos) {

                myCenter = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                centermarker.setPosition(myCenter);

                //centermarker.setMap(map);
            });
        }

        else{
            alert("Geolocation is not supported or allowed by user");
        }

        for (var i in $scope.data) {
            var tmp = $scope.data[i];
            //alert(tmp.category+"|||"+$scope.classifier);
            //if ($scope.classifier && tmp.category != $scope.classifier) {
            //    continue;
            //}
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(tmp.lat, tmp.lng),
                data: tmp,
                icon: 'images/map/' + tmp.category + '.png'
            });

            marker.setMap(map);

            google.maps.event.addListener(marker, 'click', function () {
                if (infowindow) {
                    infowindow.close();
                }
                map.setZoom(17);
                map.panTo(this.getPosition());

                infowindow = new google.maps.InfoWindow({
                    content: '<div id="iw-container">' +
                    '<div class="iw-title"><a href="' + this.data.web + '">' + this.data.name + '</a></div>' +
                    '<div class="iw-content">' +

                    '<img src="' + (this.data.logo ? this.data.logo : 'images/noimage.jpg')+ '" alt="Porcelain Factory of Vista Alegre" height="80" width="80">' +
                    '<p><strong>Discount : </strong> <a>' + this.data.discount + '</a></p>' +
                    '<p><strong>Require : </strong> ' + this.data.requirement + '</p>' +
                    '<p><strong>Note : </strong> ' + this.data.info + '</p>' +
                    '</div>' +
                    '<div class="iw-bottom-gradient"></div>' +
                    '</div>',
                    maxWidth: 300
                });

                infowindow.open(map, this);
            });
            google.maps.event.addListener(marker, 'visible_changed', function() {
                //alert(""+$scope.classifier);
            });
            markerMap[marker.data._id] = marker;
        }
        google.maps.event.addListener(map, 'click', function() {
            infowindow.close();
        });
    }
    initialize();
    $scope.initmap = function(){
        for (var key in markerMap){
            if($scope.classifier && (markerMap[key].data.category != $scope.classifier)){
                markerMap[key].setVisible(false);
            }
            else{
                markerMap[key].setVisible(true);
            }
        }
    }

    $scope.set_nyu = function(){
        map.panTo(nyuCenter);
        map.setZoom(15);
    }
    $scope.set_user = function(){
        map.panTo(myCenter);
        map.setZoom(15);
    }
    if(idfilter){
        google.maps.event.trigger(markerMap[idfilter],'click');
    }
    google.maps.event.addDomListener(window, 'load', initialize);

});

