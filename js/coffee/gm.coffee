root = @.window
current = @
per_page = 25
$ ->
	Gateway = ->
		list : []
		marker_content : _.template($("#markerContent").html())
		#marker_content : _.template('hello world')
		addSeed : (lat,lng,r) ->
			#temporaly
			@.searchFB(lat,lng,r)
		searchFB : (lat,lng,r) ->
			r = parseInt(r)
			groot = @
			console.log("#{lat},#{lng},#{r}")
			current_offset = 0
			url = "/search?type=location&center=#{lat},#{lng}&distance=#{r}&limit=25&offset="
			handle_response = (response) ->
				console.log(response)
				current_offset = current_offset + per_page
				if response.paging && (current_offset / per_page) < 5
					FB.api(url + current_offset, handle_response)
				for item in response.data
					groot.addMarker(item)
			if FB.getAuthResponse()
				console.log(current_offset)
				FB.api(url + current_offset, handle_response)
		addMarker : (item) ->
			myLatlng = new google.maps.LatLng(item.place.location.latitude,item.place.location.longitude)
			#contentString = "<div>#{item.place.name}:#{item.from.name}</div><div><img src='https://graph.facebook.com/#{item.from.id}/picture'></div>"
			marker = new google.maps.Marker(
      						position: myLatlng
      						map: current.map 
      						title: item.from.name
      					)
			infowindow = new google.maps.InfoWindow({
				content : @.marker_content({
					from_id: item.from.id
					name: item.from.name
					place: item.place.name})
				disableAutoPan : true
				})
			google.maps.event.addListener(marker,'mouseover',->
				infowindow.open(map,marker)
				)
			google.maps.event.addListener(marker,'mouseout', ->
				infowindow.close()
				)

	lat2m = (from,to) ->
		earth = 40054782
		return Math.abs(earth * ((from - to) / 360))

	root.initialize = () ->
		latlng = new google.maps.LatLng(35.666652,139.766394)
		myOptions = 
			zoom: 14
			center: latlng
			mapTypeId: google.maps.MapTypeId.ROADMAP
		
		current.map = new google.maps.Map(document.getElementById("map_canvas"),myOptions)

		google.maps.event.addListener(map,'bounds_changed', -> 
				#console.log('bounds_changed')
				lat = current.map.getCenter().lat()
				lng = current.map.getCenter().lng()
				console.log(current.map.getCenter().lat() + ";" + current.map.getCenter().lng()) 
				r = lat2m(current.map.getBounds().ca.b,current.map.getBounds().ca.f)
				gataway = new Gateway()
				gataway.addSeed(lat,lng,r)
			)
			