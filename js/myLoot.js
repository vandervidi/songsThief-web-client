var userId = window.sessionStorage.id,
    player;
var counterDownTime;
//This will hold the remaining time left counter of a song

// first, load the YouTube Iframe API:
var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// some variables (global here, but they don't have to be)
var player;
var videoId = 'SomeYoutubeIdHere';
var videotime = 0;
var timeupdater = null;

var currentChildNumber,
    totalChildNumber;

$(document).ready(function() {
	// 2. This code loads the IFrame Player API code asynchronously.
	var tag = document.createElement('script');

	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	$.ajax({
		type : "POST",
		url : 'https://songthief.herokuapp.com/songsIStole',
		data : {
			userId : userId
		},
		success : function(data) {
			if (data.success == 1) {
				$.each(data.songsList, function(key, song) {
					// Proceed only if the time left is less then 24H
					if (!is24HLeft(song.stealTimestamp)) {
						var songItem = $('<section class="song" onclick="playSong(this)" data-url="' + song.url + '">');
						// Create circle
						var circle = $('<section class="circleHolder circle' + key + '">');

						// Create song data
						var songData = $('<section class="songData">');
						var songCountDown = $('<section class="counterHolder countDown' + key + '"><span class="hoursSymbol">H</span><span class="hours"></span><span class="minutes"></span></section>');

						countDown('countDown' + key, song.stealTimestamp);

						songItem.append(songData);
						songData.append(circle);
						songData.append(songCountDown);
						songData.append('<div class="clear">');

						// Add to the screen
						$("#songs").append(songItem);

						// Calc percent to show
						var percent = calcPercentOfSecondsFrom24H(song.stealTimestamp);

						$('.circle' + key).circleProgress({
							/**
							 * This is the only required option. It should be from 0.0 to 1.0
							 * @type {number}
							 */
							value : calcPercentOfSecondsFrom24H(song.stealTimestamp) / 100,

							/**
							 * Size of the circle / canvas in pixels
							 * @type {number}
							 */
							size : 80.0,

							/**
							 * Initial angle for 0.0 value in radians
							 * @type {number}
							 */
							startAngle : -Math.PI / 4 * 2,

							/**
							 * Width of the arc. By default it's auto-calculated as 1/14 of size, but you may set it explicitly in pixels
							 * @type {number|string}
							 */
							thickness : '8',

							/**
							 * Fill of the arc. You may set it to:
							 *   - solid color:
							 *   - { color: '#3aeabb' }
							 *   - { color: 'rgba(255, 255, 255, .3)' }
							 *   - linear gradient (left to right):
							 *   - { gradient: ['#3aeabb', '#fdd250'], gradientAngle: Math.PI / 4 }
							 *   - { gradient: ['red', 'green', 'blue'], gradientDirection: [x0, y0, x1, y1] }
							 *   - image:
							 *   - { image: 'http://i.imgur.com/pT0i89v.png' }
							 *   - { image: imageObject }
							 *   - { color: 'lime', image: 'http://i.imgur.com/pT0i89v.png' } - color displayed until the image is loaded
							 */
							fill : {
								gradient : ['#2cf0b9', '#009bff'],
								gradientAngle : Math.PI / 4,
								color : '#FFFFF'
							},

							/**
							 * Color of the "empty" arc. Only a color fill supported by now
							 * @type {string}
							 */
							emptyFill : '#FFFFF',

							/**
							 * <a href="http://www.jqueryscript.net/animation/">Animation</a> config (see jQuery animations: http://api.jquery.com/animate/)
							 */
							animation : {
								duration : 800,
								easing : 'circleProgressEasing'
							},

							/**
							 * Default animation starts at 0.0 and ends at specified `value`. Let's call this direct animation.
							 * If you want to make reversed animation then you should set `animationStartValue` to 1.0.
							 * Also you may specify any other value from 0.0 to 1.0
							 * @type {number}
							 */
							animationStartValue : 0.0,

							/**
							 * Reverse animation and arc draw
							 * @type {boolean}
							 */
							reverse : false,

							/**
							 * Arc line cap ('butt' (default), 'round' and 'square')
							 * Read more: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D.lineCap
							 * @type {string}
							 */
							lineCap : 'butt',
						});

						//$('.circle'+ key).append('<img src="' +  data.victims[song.userId] + '">');

						$('.circle' + key + '> canvas').css({
							"background-image" : "url(" + data.victims[song.userId] + ")",
							"background-size" : "80px 80px",
							"background-repeat" : "no-repeat",
							"background-position" : " center center"
						});

					} else {
						// send to server this song to remove from my steal list
						// and re-enable the song at victims songs list
						giveBackSong_reenableVictimSong(song);
					}
				});
			} else {
				console.log(data.desc);
			}

		},
		error : function(objRequest, errortype) {
			console.log("Cannot get list of songs");
		}
	});

	$('#backBtn').click(function() {
		window.location.href = "nearFriends.html";
	});

	// Bind the swipeHandler callback function to the swipe event on div.box
	// on 'swipe-right'
	$("body").on("swipeleft", function(event) {
		window.location.href = "stolenFromMe.html";
	});

	$("#play").click(function() {
		var $span = $(" > span", this)[0];
		if ($($span).hasClass("glyphicon-play")) {
			$($span).removeClass("glyphicon-play").addClass("glyphicon-pause");
			player.playVideo();
		} else if ($($span).hasClass("glyphicon-pause")) {
			$($span).removeClass("glyphicon-pause").addClass("glyphicon-play");
			player.pauseVideo();
		}
	});
});

//  This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
function onYouTubeIframeAPIReady(e) {
	// load your player when the API becomes ready
	player = new YT.Player('player', {
		height : '130',
		width : '130',
		autoplay : 0,
		events : {
			'onReady' : onPlayerReady,
			'onStateChange' : onPlayerStateChange
		}
	});
}

//  The API will call this function when the video player is ready.
function onPlayerReady(event) {
	//event.target.playVideo();
}

//  The API calls this function when the player's state changes.
function onPlayerStateChange(event) {

	switch (event.data) {
	case -1:
		//unstarted
		console.log(-1);
		//player.pauseVideo();
		break;
	case 0:
		//ended
		next();
		break;
	case 1:
		//playing
		// set slider max min val
		$("#slider").prop({
			'min' : 0,
			'max' : event.target.getDuration()
		});
		break;
	case 2:
		//pause
		console.log(2);
		break;
	case 3:
		//baffering
		console.log(3);
		break;
	case 5:
		//video cued
		console.log(5);
		break;
	}
}

//Youtube stop video function
function stopVideo() {
	player.stopVideo();
}

//This functions loads a youtube song into the player
function playSong(e) {
	//initiate song child number base
	var i = 0;
	while (e.parentNode.children[i] != e)
	i++;
	//at the end i will contain the index.

	currentChildNumber = i;
	totalChildNumber = e.parentNode.childElementCount - 1;

	// Enable other buttons
	$('#prev').click(prev);
	$('#next').click(next);

	//hide screensFlow circles
	var s = e.dataset.url;
	s = s.split('=');
	s = s[1];

	$('#screensFlow').fadeOut(500);

	//reveal player
	$('#playerControlls').fadeIn(1000);
	$('#songs').css("padding-bottom", "80px");

	//load the song url to thwe player
	player.loadVideoById({
		'videoId' : s
	});

	var $span = $(" > span", "#play")[0];

	$($span).removeClass("glyphicon-play").addClass("glyphicon-pause");
	player.playVideo();

}

// when the player is ready, start checking the current time every 100 ms.
function onPlayerReady() {
	function updateTime() {
		var oldTime = videotime;
		if (player && player.getCurrentTime) {
			videotime = player.getCurrentTime();
		}
		if (videotime !== oldTime) {
			onProgress(videotime);
		}
	}

	timeupdater = setInterval(updateTime, 100);
}

// when the time changes in the player, this will be called.
function onProgress(currentTime) {
	// Change the slider
	$("#slider").val(currentTime);
}

//This song plays the previous song in the list
function prev() {
	currentChildNumber--;
	if (currentChildNumber < 0) {
		currentChildNumber = totalChildNumber;
	}
	//play
	var songTag = $('#songs').children()[currentChildNumber];
	var s = songTag.dataset.url;
	s = s.split('=');
	s = s[1];

	//load the song url to thwe player
	player.loadVideoById({
		'videoId' : s
	});

	var $span = $("#play span")[0];
	$($span).removeClass("glyphicon-play").addClass("glyphicon-pause");
}

// This function plays the next song in the list
function next() {
	currentChildNumber++;
	if (currentChildNumber > totalChildNumber) {
		currentChildNumber = 0;
	}
	//play
	var songTag = $('#songs').children()[currentChildNumber];
	var s = songTag.dataset.url;
	s = s.split('=');
	s = s[1];

	//load the song url to the player
	player.loadVideoById({
		'videoId' : s
	});
	var $span = $("#play span")[0];
	
	$($span).removeClass("glyphicon-play").addClass("glyphicon-pause");

}

//This function re-enables victim's stolen song.
function giveBackSong_reenableVictimSong(song) {
	$.ajax({
		type : "POST",
		url : 'https://songthief.herokuapp.com/giveBackSong',
		data : {
			userId : userId,
			song : song.url,
			victimId : song.userId
		},
		success : function(data) {

		},
		error : function(objRequest, errortype) {
			console.log("Cannot get list of songs that came back");
		}
	});
}

function is24HLeft(timestamp) {
	// Calculate time from timestamp untill now
	counterDownTime = timeDifference(Date.now(), timestamp);
	// If pass 48H
	if (counterDownTime.days >= 1)
		return true;
	else
		return false;
}

// calculates the percentage of a given timestamp from a 24 hours timestamp
function calcPercentOfSecondsFrom24H(timestamp) {
	var daySec = 86400;
	// 24h in seconds
	var secDiffVal = Math.floor((Date.now() - timestamp) / 1000);
	var percent = parseInt(secDiffVal * 100 / daySec);
	return percent;
}

// This function returns the difference between two timestamps
function timeDifference(dateNow, olderDate) {
	var difference = dateNow - olderDate;

	var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
	difference -= daysDifference * 1000 * 60 * 60 * 24

	var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
	difference -= hoursDifference * 1000 * 60 * 60

	var minutesDifference = Math.floor(difference / 1000 / 60);
	difference -= minutesDifference * 1000 * 60

	var secondsDifference = Math.floor(difference / 1000);

	return {
		days : daysDifference,
		hours : hoursDifference,
		minutes : minutesDifference,
		seconds : secondsDifference
	};
}

function countDown(element, userTs) {
	var interval = setInterval(function() {

		var e = element;
		//Saving an instance of the hours and minutes elements
		var remaningTime = (userTs + 86400000) - Date.now();
		var hoursElem = $('.' + element + ' .hours');
		var minutesElem = $('.' + element + ' .minutes');

		//Subtracting the days from the timestamp
		var d = Math.floor(remaningTime / 1000 / 60 / 60 / 24);
		remaningTime -= d * 1000 * 60 * 60 * 24;

		if (remaningTime - 60000 < 0) {

			$('.' + e).parents().eq(1).fadeOut("slow");
			clearInterval(interval);
			return;
		}

		//Subtracting the hours from the timestamp
		var hours = Math.floor(remaningTime / 1000 / 60 / 60);
		remaningTime -= hours * 1000 * 60 * 60;
		if (hours < 10)
			hours = "0" + hours;
		hoursElem.text(hours);

		//Subtracting the minutes from the timestamp
		var minutes = Math.floor(remaningTime / 1000 / 60);
		remaningTime -= minutes * 1000 * 60;
		if (minutes < 10)
			minutes = "0" + minutes;
		minutesElem.text(minutes);

	}, 1000);
}

