var mongoose    = require('mongoose');


// Convenience variable
var Schema = mongoose.Schema;

// Create Schema
var CardSchema = new Schema({
    userid            : String, // Owner
    imgurl            : String,
    description       : String,
    likes             : Array   // Array of ids of users that liked
},
{ 
    collection : 'cardsmotiventerest' 
});

var Card = module.exports = mongoose.model('Card', CardSchema);