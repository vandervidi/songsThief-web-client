$(document).ready(function(){
	$.ajax({
		type : "POST",
		url : 'https://songthief.herokuapp.com/getRobbersOfSongsThatAreBack',
		data : {
			userId :  window.sessionStorage.id
		},
		success : function(data) {
			if(data.success){
				console.log(data);
				$.each(data.robbersData, function(key, robber){
					$('#robbersPictures').append('<img src=" ' +  robber.profilePic + '">');
				});
			}
		},
		error : function(objRequest, errortype) {
			console.log("cannot get robbers of songs that are back");
		}
	});

	// Onclick for 'skip' button
	$('#skipBtn').click(function (){
		window.location.href = "getReady.html";
	});
});







