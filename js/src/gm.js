(function() {
  var current, per_page, root;

  root = this.window;

  current = this;

  per_page = 25;

  $(function() {
    var Gateway, lat2m;
    Gateway = function() {
      return {
        list: [],
        marker_content: _.template($("#markerContent").html()),
        addSeed: function(lat, lng, r) {
          return this.searchFB(lat, lng, r);
        },
        searchFB: function(lat, lng, r) {
          var current_offset, groot, handle_response, url;
          r = parseInt(r);
          groot = this;
          console.log("" + lat + "," + lng + "," + r);
          current_offset = 0;
          url = "/search?type=location&center=" + lat + "," + lng + "&distance=" + r + "&limit=25&offset=";
          handle_response = function(response) {
            var item, _i, _len, _ref, _results;
            console.log("test:" + current_offset);
            console.log(response.paging + ":" + (current_offset / per_page));
            current_offset = current_offset + per_page;
            if (response.paging && (current_offset / per_page) < 5) {
              FB.api(url + current_offset, handle_response);
            }
            _ref = response.data;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              item = _ref[_i];
              _results.push(groot.addMarker(item));
            }
            return _results;
          };
          if (FB.getAuthResponse()) {
            console.log(current_offset);
            return FB.api(url + current_offset, handle_response);
          }
        },
        addMarker: function(item) {
          var infowindow, marker, myLatlng;
          myLatlng = new google.maps.LatLng(item.place.location.latitude, item.place.location.longitude);
          marker = new google.maps.Marker({
            position: myLatlng,
            map: current.map,
            title: item.from.name
          });
          infowindow = new google.maps.InfoWindow({
            content: this.marker_content({
              from_id: item.from.id,
              name: item.from.name,
              place: item.place.name
            }),
            disableAutoPan: true
          });
          google.maps.event.addListener(marker, 'mouseover', function() {
            return infowindow.open(map, marker);
          });
          return google.maps.event.addListener(marker, 'mouseout', function() {
            return infowindow.close();
          });
        }
      };
    };
    lat2m = function(from, to) {
      var earth;
      earth = 40054782;
      return Math.abs(earth * ((from - to) / 360));
    };
    return root.initialize = function() {
      var latlng, myOptions;
      latlng = new google.maps.LatLng(35.666652, 139.766394);
      myOptions = {
        zoom: 14,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      current.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
      return google.maps.event.addListener(map, 'bounds_changed', function() {
        var gataway, lat, lng, r;
        lat = current.map.getCenter().lat();
        lng = current.map.getCenter().lng();
        console.log(current.map.getCenter().lat() + ";" + current.map.getCenter().lng());
        r = lat2m(current.map.getBounds().ca.b, current.map.getBounds().ca.f);
        gataway = new Gateway();
        return gataway.addSeed(lat, lng, r);
      });
    };
  });

}).call(this);
