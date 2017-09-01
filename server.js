//===========================//
//DEPENDENCIES
//===========================//
var express 			= require("express");
var app 				= express();
var bodyParser 		    = require('body-parser');
var expressValidator  	= require('express-validator');
var session           	= require('express-session');
var TwitterStrategy   	= require('passport-twitter').Strategy;
var passport          	= require('passport');
var cors                = require('cors');
var cookieParser        = require('cookie-parser');
var mongoose          	= require('mongoose');
var MemoryStore         = session.MemoryStore;
var PORT				= process.env.PORT || '3000';


//===========================//
//MODELS
//===========================//
var cardModel           = require('./models/card'),
    userModel           = require('./models/user');
    
//===========================//
//USES
//===========================//

// Point static path to dist
app.use(express.static(__dirname + '/dist'));

// Middleware / Cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Session and passport
app.use(session({ 
  secret: process.env.APIKEYSEARCHGOOGLE,
  cookie: { secure: false, maxAge: 60000 }, 
  resave: true,
  store: new MemoryStore(),
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Serializing and Deserializing User Instances
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

 
passport.deserializeUser(function(id, done) {
  
  userModel.getUserById(id, function(err, user) {
    done(err, user);
  });

});


//===========================//
//MONGOOSE
//===========================//

//Connect Mongoose
mongoose.connect(process.env.MLABDB, {
    //http://mongoosejs.com/docs/connections.html#use-mongo-client
    useMongoClient: true 
});

//Promise Handler
mongoose.Promise = require('bluebird');

// Database state
var dbConnection = mongoose.connection;

// DB connection success
dbConnection.on('connected', function()
{
   console.log('Mongoose successfully connected to MongoDB');
});

// DB connection error
dbConnection.on('error', function(error)
{
    console.log('Mongoose connection error: ' + error);
});

//===========================//
//ROUTES
//===========================//
var apiRoutes         	= require('./routes/api')(app, mongoose, passport, TwitterStrategy, cardModel, userModel);

app.use('api', apiRoutes);


//===========================//
//GET
//===========================//


//Catch all for GET that are not API routes
app.get("/", function(req, res){
	res.sendFile(__dirname + '/dist/index.html');
});

//===========================//
//APP
//===========================//

var listener = app.listen(PORT, function(){
	console.log("App listening on PORT: ", listener.address().port);
});