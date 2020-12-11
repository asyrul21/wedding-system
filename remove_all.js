var mongoose = require("mongoose");
var Task = require("./models/task");

function remove_all(){
    Task.remove({}, function(err){});
}

module.exports = remove_all;