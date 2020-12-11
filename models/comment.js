var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        },
        username: String
    },
    
    dateAdded: String
    
});

var Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;