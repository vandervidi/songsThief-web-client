$(document).ready(function() {

	window.fbAsyncInit = function() {
		$.ajax({
			type : "POST",
			url : 'https://songthief.herokuapp.com/getAppId',
			success : function(data) {
				console.log(data.appId);
				FB.init({
					appId : data.appId,
					xfbml : true,
					version : 'v2.3'
				});

				FB.getLoginStatus(function(response) {
					//If the user is already logged in from a previous session  - redirect him to the next page
					if (response.status === 'connected') {
						getAllFbData(response);
					}
				});

				$("#loginbutton").click(function() {
					console.log("clicked connect button");
					/* Login */
					FB.login(function(response) {
						getAllFbData(response);
					}, {
						scope : 'user_friends'
					});
				});
			},
			error : function(objRequest, errortype) {
				console.log("Cannot get followd users Json");
			}
		});

	}; ( function(d, s, id) {
			var js,
			    fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {
				return;
			}
			js = d.createElement(s);
			js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
});

function saveUserData(userId, profilePic, friendsListFb) {
	console.log("AJAX ", friendsListFb);
	// Create new friends list from response 'friendsList'
	var friendsList = [];
	$.each(friendsListFb, function(i, friend) {
		friendsList.push(friend.id);
	});
	console.log('friendsList ', friendsList);

	$.ajax({
		type : "POST",
		url : 'https://songthief.herokuapp.com/connect',
		data : {
			userId : userId,
			profilePic : profilePic,
			friendsList : friendsList,
			location : {
				lat : 31.974378,
				lng : 34.7739333
			}
		},
		success : function(data) {
			console.log('data: ', data);
			if (data.success) {
				
				//Save logged-in user facebook Id in local sessionStorage
				window.sessionStorage.setItem("id", userId);

				/*  If the user was successfully created/modified
				 *   redirect to the next page.
				 * 	There are 3 cases:
				 * 	1) The user was robbed - Redirect to the page that notifies about it
				 *  2) User was not robbed since his last login but the are songs that are back from on of his previous robbers
				 * 	3) The user was not robbed and has not songs that are back - Redirect to the page that allows him to start robbing his friends
				 */
				if (data.isRobbed)
					//Case 1
					window.location.href = "youAreRobbed.html";
				else if (data.songAreBack) {
					//Case 2
					window.location.href = "songComeBack.html";
				} else {
					//Case 3
					window.location.href = "getReady.html";
				}
			} else {
				// prompt msg to user on failure
				alert('We are sorry,\nthere is an error.');
			}
		},
		error : function(objRequest, errortype) {
			console.log("Cannot get followd users Json");
		}
	});
}

function getAllFbData(response) {
	/* Get friends */
	FB.api('/me/friends', function(resFriends) {
		console.log('get FB friends ', resFriends);

		/* Profile picture */
		FB.api('/' + response.authResponse.userID + '/picture', function(resProfilePic) {
			if (response && !response.error) {
				/* handle the result */
				saveUserData(response.authResponse.userID, resProfilePic.data.url, resFriends.data);
			}
		});
	});
}