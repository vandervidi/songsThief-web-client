$(document).ready(function() {
	// Get Robbers picture link
	$.ajax({
		type : "POST",
		url : 'https://songthief.herokuapp.com/getRobbers',
		data : {
			userId : window.sessionStorage.id,
		},
		success : function(data) {
			console.log('data: ', data);
			if (data.success) {
				//Configurin navifation
				if(data.songsAreBack){
					// Onclick for 'skip' button
					$('#skipBtn').click(function (){
						window.location.href = "songComeBack.html";
					});
				}
				else{
					// Onclick for 'skip' button
					$('#skipBtn').click(function (){
						window.location.href = "getReady.html";
					});
				}



				$.each(data.robbersData, function(key, val) {
				  $("#robbers").append("<img src=" + val.profilePic + " alt=" +  val.robberId + ">");
				});
			} else {
				// prompt msg to user on failure
				alert('We are sorry,\nthere is an error.');
			}
		},
		error : function(objRequest, errortype) {
			console.log("Cannot get followd users Json");
		}
	}); 
});