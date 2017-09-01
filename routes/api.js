var express 	= require('express');
var userModel   = require('../models/user')
var cardModel   = require('../models/card')

module.exports = function(app, mongoose, passport, TwitterStrategy)
{
    'use strict';

//Router
var api = express.Router();


//===========================//
//CARDS
//===========================//


/// Creates a new card
app.post('/api/cards/newcard', function(req, res){
	
	console.log("new req for a new card: ", req.body);

	var userid 			= req.body.userid;
	var imgurl 			= req.body.imgurl;
	var imgdescription 	= req.body.description;

	if(userid !== undefined && imgurl !== undefined && imgdescription !== undefined){

		//Look for user
		userModel.findById(userid, function(err, user){
			if(err){
				console.log("Error: ", err);
				res.send({"status": "error", "msg": "Error fetching user"})
				res.end();
			}else {
				console.log("User found: ", user);

				//Save card
				var newCard = new cardModel({
					userid            : userid,
        			imgurl            : imgurl,
        			description       : imgdescription
				})
				newCard.save().then(function(card){
				  console.log("Card Saved.")
	              res.send({'status': 'success', 'msg': 'Card created', card: card});
	              res.end();
	            });
			}
		});

	} else {

		res.send({"status": "error", "msg": "Not enough data"})
		res.end();
	}

});

/// Get all cards for home presentation
app.get('/api/cards/latest', function(req, res){

	cardModel.find().then(function(result){

		console.log("Cards: ", result.length);
		res.send(result);
        res.end();

	}, function(err){

          console.log('Error fetching cards for home');
          res.send({'error': 'Error fetching cards for home '+err+''});
          res.end();

    });

});

/// Gets cards from user
app.get('/api/cards/:iduser', function(req, res){

	var userid = req.params.iduser;
	if(userid !== undefined) {

		console.log("Running request for user: ", req.params);
		var query = {userid: userid};
		cardModel.find(query).then(function(result){

		console.log("Cards from user: ", result.length);
		res.send(result);
        res.end();

	}, function(err){

          console.log('Error fetching cards from user: ', err);
          res.send({'error': 'Error fetching cards from user '+err+''});
          res.end();

    });

	} else {

		console.log("No userid on request for user: ", req.params);
		res.send({"status": "error", "msg": "Not enough data"});
		res.end();
	}

});

/// Removes card if user and card match
app.post('/api/cards/remove', function(req, res){

	var userid = req.body.iduser;
	var idcard = req.body.idcard;
	console.log(req.body);

	if(userid !== undefined && idcard !== undefined) {

		console.log("Running remove request: ", req.body);
		var query = {_id: idcard, userid: userid};
		cardModel.findById(idcard, function(err, result){

			if(err){
			  console.log('Error removing card: ', err);
	          res.send({'error': 'Error removing card '+err+''});
	          res.end();
			} else {

				result.remove()
				res.send({'status': 'success', 'msg':'Card removed'});
	          	res.end();
			}

		});

	} else {

		console.log("Not enough data: ", req.body);
		res.send({"status": "error", "msg": "Not enough data"});
		res.end();
	}

});


//===========================//
//USER
//===========================//

/// Return session information of the user.
app.get('/api/user/session',function(req, res){
  
  console.log("running /user/session/ ", req.user);
  
  if(req.user !== undefined){
    
    res.send(req.user);
    res.end();

  } else {

    res.send({})
    res.end();

  }

});

//===========================//
//AUTH for TWITTER
//===========================//

passport.use(new TwitterStrategy({
    consumerKey: process.env.FREECODECAMPMOTIVENTERESTKEY,
    consumerSecret: process.env.FREECODECAMPMOTIVENTERESTSECRET,
    callbackURL: "http://localhost:3000/api/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {

    var usernameTwitter = profile.username;

    //First check if we have username
    userModel.getUserByUsername(usernameTwitter, function(err, user){
      
      //Check for error fetching
      if (err) { return done(err); }

      //Create user if does not exist, log in if exists.
      if(!user){

        //Create Registration
        var newUser = new userModel({
            'username': usernameTwitter
        });
        newUser.save()
        return done(null, newUser);

      } else {

        //user found
        return done(null, user);

      }

    });

  }
));

app.get('/api/auth/twitter', passport.authenticate('twitter'));

app.get('/api/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/' }));

return api

}