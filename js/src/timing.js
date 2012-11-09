(function() {
  var current, per_page, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  root = this.window;

  current = this;

  per_page = 25;

  $(function() {
    var Gateway, lat2m;
    Gateway = (function() {

      function Gateway() {
        this.searchFired = __bind(this.searchFired, this);
        this.positions = [];
        this.mark_positions = [];
        this.ex_position = [];
        this.marker_content = _.template($("#markerContent").html());
      }

      Gateway.prototype.addSeed = function(lat, lng, r) {
        if (this.mark_positions.length > 1) {
          this.mark_positions.shift();
        }
        return this.mark_positions.push([lat, lng, r, +(new Date)]);
      };

      Gateway.prototype.searchFired = function() {
        if (this.positions.length > 1) {
          this.positions.shift();
        }
        this.positions.push(this.mark_positions[0]);
        if (this.isStable()) {
          if (this.isMove()) {
            this.ex_position = this.positions[0];
            console.log("search!");
            return this.searchFB(this.ex_position[0], this.ex_position[1], this.ex_position[2]);
          }
        }
      };

      Gateway.prototype.isMove = function() {
        var delta;
        if (this.ex_position.length === 0) {
          return true;
        } else if (this.positions.length < 2) {
          return true;
        } else {
          delta = Math.abs(this.positions[0][0] - this.ex_position[0]) + Math.abs(this.positions[0][1] - this.ex_position[1]);
          if (delta > 0.0001) {
            return true;
          } else {
            return false;
          }
        }
      };

      Gateway.prototype.isStable = function() {
        if (this.positions.length < 2) {
          return true;
        } else {
          if (this.positions[0][0] === this.positions[1][0] && this.positions[0][1] === this.positions[1][1]) {
            return true;
          } else {
            return false;
          }
        }
      };

      Gateway.prototype.searchFB = function(lat, lng, r) {
        var current_offset, handle_response, url,
          _this = this;
        r = parseInt(r);
        current_offset = 0;
        url = "/search?type=location&center=" + lat + "," + lng + "&distance=" + r + "&limit=25&offset=";
        handle_response = function(response) {
          var item, _i, _len, _ref, _results;
          console.log(response);
          console.log(response.paging + ":" + (current_offset / per_page));
          current_offset = current_offset + per_page;
          if (response.paging && (current_offset / per_page) < 5) {
            FB.api(url + current_offset, handle_response);
          }
          _ref = response.data;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            _results.push(_this.addMarker(item));
          }
          return _results;
        };
        if (FB.getAuthResponse()) {
          return FB.api(url + current_offset, handle_response);
        }
      };

      Gateway.prototype.addMarker = function(item) {
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
      };

      return Gateway;

    })();
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
      current.gateway = new Gateway();
      setInterval(current.gateway.searchFired, 500);
      return google.maps.event.addListener(map, 'bounds_changed', function() {
        var lat, lng, r;
        lat = current.map.getCenter().lat();
        lng = current.map.getCenter().lng();
        console.log(current.map.getCenter().lat() + ";" + current.map.getCenter().lng());
        r = lat2m(current.map.getBounds().ca.b, current.map.getBounds().ca.f);
        return gateway.addSeed(lat, lng, r);
      });
    };
  });

}).call(this);
