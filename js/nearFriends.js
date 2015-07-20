var draggedUserId,
    map,
    overlay,
    userLocatinoOffset = 0.00008;  //Offset to present user location at the bottom of the map instead of the center

//Setting user STATIC location - Shenkar college
var mapCenter = {
	lat : 32.0900000 + userLocatinoOffset,
	lng : 34.8030835
};


/*
 * Google Maps initalization
 */
function initialize() {
	var myLatlng = new google.maps.LatLng(mapCenter.lat, mapCenter.lng);
	map = new google.maps.Map(document.getElementById('gMap'), {
		zoom : 21,
		center : myLatlng,
		disableDefaultUI : true,
		draggable : false,
		scrollwheel : false,
		disableDoubleClickZoom : true
	});

	var overlay = new google.maps.OverlayView();
	overlay.draw = function() {
	};

	overlay.onAdd = function() {
		var projection = this.getProjection();
		var pixel = null;

		$.ajax({
			type : "POST",
			url : 'https://songthief.herokuapp.com/getFriendsLocations',
			data : {
				userId : window.sessionStorage.id,
			},
			success : function(data) {
				if (data.success) {
					var marker;
					$.each(data.friendsData, function(key, val) {
						pixel = new google.maps.LatLng(val.location.lat, val.location.lng);
						marker = new google.maps.Marker({
							position : pixel,
							optimized : false,
							map : map
						});

						//Display a profile pic only if it is in the map boundries
						if (map.getBounds().contains(marker.getPosition())) {
							pixel = projection.fromLatLngToContainerPixel(marker.getPosition());
							$("#wrapper").append($("<section>").attr("id", val.friendId).addClass('draggable').css({
								'position' : 'absolute',
								'top' : pixel.y,
								'left' : pixel.x,
								'width' : '60px',
								'height' : '60px',
								'background' : "url(" + val.profilePic + ") no-repeat",
								'background-size' : 'contain'
							}));
						}
					});

					//Draggable event configurations
					$(".draggable").draggable({
						containment : "#wrapper",
						revert : "invalid",
						scroll : false,
						start : function() {
							draggedUserId = $(this).attr('id');
						}
					});

				} else {
					// prompt msg to user on failure
					alert('We are sorry,\nthere is an error.');
				}
			},
			error : function(objRequest, errortype) {
				console.log("Cannot get locations");
			}
		});
	};
	overlay.setMap(map);

}


$(document).ready(function() {
	google.maps.event.addDomListener(window, 'load', initialize);

	//Droppable event configurations
	$("#chestHolder").droppable({
		accept : ".draggable",
		activeClass : "droppableGlowingChest",
		hoverClass : "droppableObjectOverChest",
		drop : function(event, ui) {
			ui.draggable.css("display", "none");
			$("#chestHolder").removeClass();
			$("#chestHolder").addClass("droppableChestAfterUserDropped");

			$.ajax({
				type : "POST",
				url : 'https://songthief.herokuapp.com/rob',
				data : {
					robberId : window.sessionStorage.id,
					victimId : draggedUserId,
					stealTimestamp : Date.now()
				},
				success : function(data) {
					if (data.success) {
						window.location.href = "timeToRun.html";
					}
				},
				error : function(objRequest, errortype) {
					console.log("cannot get robbers of songs that are back");
				}
			});

		}
	});

	// Onclick for 'skip' button
	$('#skipBtn').click(function() {
		window.location.href = "myLoot.html";
	});

});

