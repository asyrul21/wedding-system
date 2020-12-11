var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var guestSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        uniqueCaseInsensitive: true
    },
    count: Number,
    remarks: String,
    status: String
});

guestSchema.plugin(uniqueValidator, {message: 'This name is already in the guestlist.'});

var Guest = mongoose.model("Guest", guestSchema);
module.exports = Guest;