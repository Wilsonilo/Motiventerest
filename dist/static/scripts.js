//===========================//
//Really tired now, so don't judge my for the lack of security and stuff please :(
//===========================//

//GLOBALS
var userLogged 		= false;
var userObject 		= {};
var gridElements 	= [];
var userStuff		= [];
var mystuffShowing	= false;
var homeShowing		= true;

$(document).ready(function(){

	if(userLogged === false){
		$("#navbarNavDropdown ul").fadeOut();
	}

	//Check callback from Twitter.
	checkUserSession();

	//Fetch Grid for home
	fetchGridForHome();

	//Handlers

	//Show Mystuff/Home Stuff
	$("#showmystuff").click(function(){
		toggleShowing();
	})

	//Save new Motivation
	$("#savenewmotivation").on('click', function(){

		saveMotivation();

	});

	//Try to load image inside Modal / New Motivation 
	$("#urlimgmoti").focusout(function(){
		if($("#urlimgmoti").val() !== ""){
			var imgurl = $("#urlimgmoti").val();
			$("#newmotivationimgarea").html('').append('<img src="'+imgurl+'" class="img-fluid animated flash">')
		}
	});
});


//===========================//
//Helpers
//===========================//

/// Check user Session and sets userObject if is not null
function checkUserSession(){

	//Fetch user session
	$.get('api/user/session', function(data){

      userObject = data;

    }).done(function(){
        if(userObject.username !== undefined){
        	userLogged = true;

        	//Hide Welcome
        	$("#welcoming").fadeOut();

        	//Show modal button
        	$("#navbarNavDropdown ul").fadeIn();

        	//Adjust Login/logout Button
        	$("#loginlogout").html("Logout").attr("href", "api/user/logout");

        	//Fetch user stuff
        	fetchUserData();
        } 
    });
}

/// Asks to the API for all the cards from the DB, later on should be a limit
function fetchGridForHome(){

	//Reset
	gridElements = [];

	//Fetch
	$.get('api/cards/latest', function(data){


      gridElements = data;


    }).done(function(){

    	//console.log("Done fetching home", gridElements.length);

    	updateGrid();

    });
}

/// User is logged so we fetch his/her stuff
function fetchUserData(){
	
	//Reset
	userStuff = [];

	//Fetch
	$.get('/api/cards/'+userObject._id, function(data){

      userStuff = data;

    }).done(function(){

    	updateUserGrid();
    	//console.log("Done fetching user stuff", userStuff);

    });
}

//Callback after fetching home grid
function updateGrid(){

	//Create cards on grid home;
	for(var i =0; i < gridElements.length; i++){
		$("#grid").append('<div class="card animated bounce col-3 '+gridElements[i]._id+'" style="width: 20rem;"><img class="card-img-top" src="'+String(gridElements[i]['imgurl'])+'" alt="Card image cap"><div class="card-body"><small class="card-text">'+String(gridElements[i]['description'])+'</small></div></div>');
	}
	// $('#grid').masonry({
	//   // options...
	//   itemSelector: '.card',
	//   columnWidth: 200
	// });
}

//Callback after fetching user grid
function updateUserGrid(){

	//Create cards on grid home;
	for(var i =0; i < gridElements.length; i++){
		$("#mystuff").append('<div class="card animated bounce col-3 '+userStuff[i]._id+'" style="width: 20rem;"><img class="card-img-top" src="'+String(userStuff[i]['imgurl'])+'" alt="Card image cap"><div class="card-body"><small class="card-text">'+String(userStuff[i]['description'])+'</small><button class="btn btn-sm btn-danger" onclick="removeCard(\''+String(userStuff[i]._id).trim()+'\')"><i class="fa fa-minus-circle" aria-hidden="true"></i></button></div></div>');
	}
	// $('#mystuff').masonry({
	//   // options...
	//   itemSelector: '.card',
	//   columnWidth: 200
	// });
	$('#mystuff').slideUp();
}

/// Saves motivation from modal
function saveMotivation(){

	if($("#urlimgmoti").val() !== "" && $("#descriptionmoti").val() !== "" && userObject._id !== undefined){

		//Both fields seem to be ok, post it.
		//Here we should to a loooooot more stuff to see if everything is ok, but for now, let's just hope for the best.
		var parameters = {
			userid: userObject._id,
			imgurl: $("#urlimgmoti").val(),
			description:$ ("#descriptionmoti").val()
		}
		$.post("api/cards/newcard", parameters, function(data){

			//Card Saved
			if(data.status === "success"){

				//Clean modal
				$("#urlimgmoti").val('');
				$("#descriptionmoti").val('');
				$("#newmotivationimgarea").html('');

				//Close modal
				$('#newMotivationModal').modal('hide');

				//Reload My stuff
				fetchUserData();

				//Reload home.
				fetchGridForHome();
			}
		})
		.done(function() {
		  console.log("Sent");
		})
		.fail(function(err) {
		  console.log("Error", err);
		});
	}

}

/// Removes card from User
function removeCard(idCard){

	var iduser = userObject._id;
	if(iduser !== undefined && idCard !== undefined){

		var parameters = {
			iduser: iduser,
			idcard: idCard
		}

		$.post("api/cards/remove", parameters, function(data){

			//Card Saved
			if(data.status === "success"){

				//Clean modal
				$("."+idCard).remove();
			}
		})
		.done(function() {
		  console.log("Sent");
		})
		.fail(function(err) {
		  console.log("Error", err);
		});

	}
}

/// Toggles the showing of My stuff and home cards grid
function toggleShowing(){

	if(homeShowing){

		$("#mystuff").slideToggle();
		$("#grid").slideToggle();
		homeShowing = false;
	} else {
		$("#grid").slideToggle();
		$("#mystuff").slideToggle();
		homeShowing = true;
	}

}