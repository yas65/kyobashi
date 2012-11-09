root = @.window
current = @
per_page = 25
$ ->
	class Gateway
		#searched_position = []
		#positions = []
		#groot = @
		constructor: () ->
			#一定のタイミングで現在の位置を保持
			@positions = []
			#Google Map上で移動イベントが起こる度に更新される位置情報を保持
			@mark_positions = []
			#前回facebookのAPIを呼び出した時の位置情報を保持　
			@ex_position = []
			#テンプレートの準備
			@marker_content = _.template($("#markerContent").html())
		addSeed : (lat,lng,r) ->
			#直近の2件だけ保持している。多分1件だけでも大丈夫そう。
			if @mark_positions.length > 1
				@mark_positions.shift()
			@mark_positions.push([lat,lng,r,+new Date])
		searchFired : () =>
			#最新のGoogle Map上の位置を取得
			if @positions.length > 1
				@positions.shift()
			@positions.push(@mark_positions[0])

			#前回と比べて位置が安定しているか？
			if @isStable()
				#console.log(@positions[0])
				#前回APIを検索した時より、位置が動いているか？
				if @isMove()
					@ex_position = @positions[0]
					console.log("search!")
					@searchFB(@ex_position[0],@ex_position[1],@ex_position[2])
		isMove : () ->
			if @ex_position.length == 0
				true
			else if @positions.length < 2
				true
			else
				#移動距離を計算.
				delta = Math.abs(@positions[0][0] - @ex_position[0]) + Math.abs(@positions[0][1] - @ex_position[1])
				#console.log(delta)
				if delta > 0.0001
					true
				else
					false
		isStable : () ->
			if @positions.length < 2
				true
			else
				#console.log((@positions[0][0] == @positions[1][0]) + ":" + (@positions[0][1] == @positions[1][1]))
				#console.log(@positions[0][0] + ":"  + @positions[1][0] + ":" + @positions[0][1] + ":" + @positions[1][1])
				if @positions[0][0] == @positions[1][0] && @positions[0][1] == @positions[1][1]
					true
				else
					false
		searchFB : (lat,lng,r) ->
			r = parseInt(r)
			#groot = @
			#console.log("#{lat},#{lng},#{r}")
			current_offset = 0
			url = "/search?type=location&center=#{lat},#{lng}&distance=#{r}&limit=25&offset="
			handle_response = (response) =>
				console.log(response)
				console.log(response.paging + ":" + (current_offset / per_page))
				current_offset = current_offset + per_page
				if response.paging && (current_offset / per_page) < 5
					FB.api(url + current_offset, handle_response)
				for item in response.data
					#groot.addMarker(item)
					@addMarker(item)
			if FB.getAuthResponse()
				#console.log(current_offset)
				FB.api(url + current_offset, handle_response)
		addMarker : (item) ->
			myLatlng = new google.maps.LatLng(item.place.location.latitude,item.place.location.longitude)
			marker = new google.maps.Marker(
      						position: myLatlng
      						map: current.map 
      						title: item.from.name
      					)
			infowindow = new google.maps.InfoWindow({
				content : @marker_content({
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
		current.gateway = new Gateway()
		setInterval(current.gateway.searchFired,500)
		google.maps.event.addListener(map,'bounds_changed', -> 
				#console.log('bounds_changed')
				lat = current.map.getCenter().lat()
				lng = current.map.getCenter().lng()
				console.log(current.map.getCenter().lat() + ";" + current.map.getCenter().lng()) 
				r = lat2m(current.map.getBounds().ca.b,current.map.getBounds().ca.f)
				#gateway = new Gateway()
				gateway.addSeed(lat,lng,r)
				
			)