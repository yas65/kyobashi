 window.fbAsyncInit = function() {
    // init the FB JS SDK
    FB.init({
      appId      : '431452983582422', // App ID from the App Dashboard
      channelUrl : '//k65y.com/channel.html', // Channel File for x-domain communication
      status     : true, // check the login status upon init?
      cookie     : true, // set sessions cookies to allow your server to access the session?
      xfbml      : true  // parse XFBML tags on this page?
    });
    FB.getLoginStatus(function(response) {
    	if (response.status === 'connected') {
    		FB.api("/me",function(res){console.log('Good to see you, ' + res.name + '.')});
    		//getPosition();
    	} else if (response.status === 'not_authorized') {
    		// not_authorized
    		login();
    	} else {
    		// not_logged_in
    		login();
  		}
 	});
    
    // Additional initialization code such as adding Event Listeners goes here

  };

  // Load the SDK's source Asynchronously
  (function(d){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all.js";
     ref.parentNode.insertBefore(js, ref);
   }(document));

	function login() {
    	FB.login(function(response) {
        	if (response.authResponse) {
            	// connected
            	FB.api("/me",function(res){console.log('Good to see you, ' + res.name + '.')});
        	} else {
            	// cancelled
        	}
    	},{scope: 'email,user_likes,user_status,friends_status,user_location,friends_location,user_photos,friends_photos'});
	}

	function getPosition(){
    	if(navigator.geolocation){
    		navigator.geolocation.getCurrentPosition(function(position){
    			console.log(position.coords.latitude,position.coords.longitude);
    			lat = position.coords.latitude;
    			lon = position.coords.longitude;
    			FB.api("/search?type=location&center=" + lat + "," + lon + "&distance=100",function(response){
    				console.log(response);
    			})
    		});
    	}else{
    		console.log("Couldn't get current location.")
    	}
    }