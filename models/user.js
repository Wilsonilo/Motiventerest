//Requires
var mongoose    = require('mongoose');

// Convenience variable
var Schema = mongoose.Schema;

//Create Schema
var UserSchema = new Schema(
    {
        username : String
    },
    { 
        collection : 'usersmotiventerest' 
    }
); 

var User = module.exports = mongoose.model('User', UserSchema);

// Method to check if user exists on DB
module.exports.getUserByUsername = function(username, callback){
    var query = {'username': username};
    User.findOne(query, callback);
}

// Method get user by Id
module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}