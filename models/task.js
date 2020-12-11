var mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    author: {
        id : {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin"
        },
        username : String
    },
    
    progress: Number,
    
    pic: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        },
        username: String
    },
    
    comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
        ]
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;