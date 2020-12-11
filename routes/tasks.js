const express = require('express');
const router = express.Router();

const Task = require('../models/task');
const Admin = require('../models/admin');
const middleware = require('../middleware/index');
const moment = require('moment');

//index routes - view all
//view all
router.get('/' ,function(req, res){
    // res.send('This is where you view all tasks!');
    // res.render('tasks', {tasks: tasks});
    // console.log('Before sanitizing: ', testObj);
    // console.log('After sanitizing: ', middleware.sanitizeObject(req, testObj));
    
    //view all tasks in DB
    Task.find({}, function(err , allTasks){
        if(err){
            console.log(err);
        }else{
            res.render('tasks/index', {tasks: allTasks});
        }
    });
});

//add new task form
router.get('/new', middleware.isLoggedIn, function(req, res){
    // res.render('tasks/new');
    
     Admin.find({}, function(err, allAdmins){
        if(err){
            console.log(err);
            req.flash('error', 'Something went wrong');
            res.redirect('/tasks');
        }else{
            // console.log('ADMINS: ', allAdmins);
            res.render('tasks/new', {admins : allAdmins});
        }
            
    });
    
});

//add new task post request
router.post('/' , middleware.isLoggedIn ,function(req, res){
    // console.log('BODY PARSER TEST:', req.body.pic.username);
    Admin.findById(req.body.pic, function(err, foundAdmin){
        if(err || !foundAdmin){
            console.log('Admin not found!', err);
            req.flash('error', 'Something went wrong');
            res.redirect('/tasks');
        }else{
            var name = req.body.name;
    
            if(req.body.image === ''){
                var image = 'https://images.pexels.com/photos/1020323/pexels-photo-1020323.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260';
            }else{
                var image = req.body.image;
            }
            
            // text area fix
            var desc = req.body.description;
            var desc_replacedNewLine = desc.replace(/(?:\r\n|\r|\n)/g, '<br>');
            
            var author = {
                id: req.user._id,
                username: req.user.username
            }
            var progress = req.body.progress;
            
            var pic = {
                id: foundAdmin._id,
                username: foundAdmin.username
            }
            
             var newTask = {
                name: req.sanitize(name),
                image: req.sanitize(image),
                description: req.sanitize(desc_replacedNewLine).trim(),
                author: author, //auto assign
                progress: progress, // does not need sanitization
                pic: pic //auto assign
            }
            
            // console.log('Task to add:', newTask);
            // res.redirect('/tasks');
            
            // create new task in DB
            Task.create(newTask, function(err, newlyCreated){
                if(err){
                    console.log(err);
                }else{
                    res.redirect("/tasks"); //redirect is URL path, but render is the FILE path 
                }
            });
        }
    });
});

//show page for each task
router.get('/:id', function(req, res){
    
    // console.log('Request PARAMS:', req.params); //params is from colon of url /tasks/:id
    // res.send("This will be show PAGE!");
    
     Task.findById(req.params.id).populate("comments").exec(function(err, foundTask){
         if(err || !foundTask){
             console.log(err);
             req.flash("error", "No such task!");
             res.redirect('/tasks');
         }else{
             res.render('tasks/show', {task: foundTask, moment: moment});
         }
     });
});

//edit form
router.get('/:id/edit', middleware.checkTaskOwnership, function(req, res){
    // res.send('EDIT form for task!');
        
    // Task.findById(req.params.id, function(err, foundTask){
    //     if(err || !foundTask){
    //         console.log(err);
    //         req.flash('error', 'No such Task found.');
    //         res.redirect('/tasks');
    //     }else{
    //         res.render('tasks/edit', {task: foundTask})        
    //     }
    // })
    
    Admin.find({}, function(err, allAdmins){
        if(err){
            console.log(err);
            req.flash('error', 'Something went wrong');
            res.redirect('/tasks');
        }else{
            Task.findById(req.params.id, function(err, foundTask){
                res.render('tasks/edit', {task: foundTask, admins: allAdmins});
            });
        }
    });
});

//update logic
router.put('/:id', middleware.checkTaskOwnership,function(req, res){
    // console.log('Updated task:', req.body.task);
    
    const adminID = req.body.task.picid;
    
    Admin.findById(adminID, function(err, foundadmin){
        if(err || !foundadmin){
            console.log(err);
            req.flash('error', 'Something went wrong.');
            res.redirect('/');
        }else{
            var adminUsername = foundadmin.username;
            
            //== updated task object
            const taskUpdate = {
                name: req.sanitize(req.body.task.name),
                image: req.sanitize(req.body.task.image),
                description: req.sanitize(req.body.task.description).trim().replace(/(?:\r\n|\r|\n)/g, '<br>'),
                progress: req.body.task.progress, // does not need sanitization
                pic : {
                    id: req.body.task.picid,
                    username: foundadmin.username
                } //auto assign
            }
            
            // console.log('Task to be updated:', taskUpdate);
            
            // Task.findByIdAndUpdate(req.params.id, req.body.task, function(err, editedTasks){
            Task.findByIdAndUpdate(req.params.id, taskUpdate, function(err, editedTasks){
                if(err || !editedTasks){
                    console.log(err);
                    req.flash('error', 'Editing task was unsuccessful');
                    res.redirect('back');
                }else{
                    req.flash('success', 'Successfully updated Task!');
                    res.redirect('/tasks/' + req.params.id);
                }
            });
        }
    })
});

//delete route
router.delete('/:id', middleware.checkTaskOwnership, function(req, res){
    
    Task.findByIdAndRemove(req.params.id, function(err, foundTask){
        if(err || !foundTask){
            res.redirect('/tasks');
        }else{
            res.redirect('/tasks');
        }
    });
});

module.exports = router;
