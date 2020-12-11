var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var AdminSchema = new mongoose.Schema({
    usernmae: String,
    password: String
});

AdminSchema.plugin(passportLocalMongoose);

var Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;