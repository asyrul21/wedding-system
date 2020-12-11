const express = require('express');
// const router = express.Router();
var router = express.Router({mergeParams: true}); //merge params is important!
const moment = require('moment');


const Task = require('../models/task');
const Comment = require('../models/comment');

const middleware = require('../middleware/index');

//== add new comments FORM
router.get('/new', middleware.isLoggedIn, function(req, res){
    // res.send('THIS IS NEW COMMENTS PAGE!');
    
    Task.findById(req.params.id, function(err, task){
        if(err || !task){
            // res.send('TASK not found');
            console.log(err);
            res.redirect('back');
        }else{
            res.render('comments/new', {task: task});
        }
    })
});

//add new comments // sanitized
router.post('/', middleware.isLoggedIn, function(req, res){
    // res.send('COMMENTS POST ROUTE!');
    
    Task.findById(req.params.id, function(err, foundTask){
        if(err || !foundTask){
            console.log(err);
            req.flash('error', 'No such Task exists.');
            res.redirect('back');
        }else{
            //comment[] object is passed via req.body
            const sanitizedComment = req.sanitize(req.body.comment.text).trim().replace(/(?:\r\n|\r|\n)/g, '<br>');
            const newCommentSanitized = {
                text : sanitizedComment
            }
  
            // Comment.create(req.sanitize(req.body.comment), function(err, newComment){
            Comment.create(newCommentSanitized, function(err, newComment){
                if(err || !newComment){
                    console.log(err);
                    req.flash('error', 'Something went wrong.');
                    res.redirect('back');
                }else{
                    
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.dateAdded = moment().format();
                    newComment.save();
                    
                    foundTask.comments.push(newComment);
                    foundTask.save();
                    req.flash('success', 'New comment successfully added!');
                    // res.redirect('/tasks/' + req.params.id); OR
                    res.redirect('/tasks/' + foundTask._id);
                }
            })
        }
    })
});

//comment edit form 
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res){
    
    Task.findById(req.params.id, function(err, foundTask){
        if(err || !foundTask){
            req.flash('error', 'Task does not exist!');
            res.redirect('back')
        }else{
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err || !foundComment){
                    // console.log(err);
                    req.flash('error', 'Comment not found.');
                    res.redirect('back');
                }else{
                    // console.log('params id:', req.params.id);
                    res.render('comments/edit', {task_id: req.params.id, comment: foundComment});
                }
            })
        }
    });
});

//comment updating logic // sanitized
router.put('/:comment_id', middleware.checkCommentOwnership, function(req,res){
    // console.log('link works!');
    let newComment = {
        text: req.sanitize(req.body.comment.text).trim().replace(/(?:\r\n|\r|\n)/g, '<br>'),
        dateAdded: moment().format()
    }
    
    // req.body.comment.dateAdded = moment().format();
    
    // Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
    Comment.findByIdAndUpdate(req.params.comment_id, newComment, function(err, updatedComment){
        if(err){
            req.flash('error', 'Something went wrong while updating comment.');
            res.redirect('back');
        }else{
            req.flash('Comment successfully updated!')
            res.redirect('/tasks/' + req.params.id);
        }
    })
});

//comment delete route
router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            console.log(err);
            res.redirect('back');
        }else{
            console.log('Comment deleted!');
            req.flash('success', 'Comment deleted!');
            res.redirect('/tasks/' + req.params.id);
        }
    });
});

module.exports = router;