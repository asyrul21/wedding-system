const express = require('express');
const router = express.Router();

const passport = require('passport');
const Admin = require('../models/admin');

//landing page
router.get('/', function(req, res){
    // res.send('This is the landing page!');
    res.render('landing');
});

//authentication
//show register form
router.get('/register', function(req, res){
    res.render('register');
});

// sign up logic
router.post('/register', function(req, res){
    // res.send("Sign Up PAGE!");
    
    var newAdmin = new Admin({username: req.sanitize(req.body.username).trim()});
    Admin.register(newAdmin, req.body.password, function(err, admin){
        if(err){
            // console.log(err);
            req.flash("error", err.message);
            res.redirect('/register');
        }else{
            // passport.authenticate('local')(req, res, function(){
            //     req.flash("success", "Welcome, " + admin.username);
            //     res.redirect('/tasks');
            // });
            req.flash("success", "Added " + admin.username + " as new admin!");
            res.redirect('/register');
        }
    });
});

//login form
router.get('/login', function(req, res){
    
    res.render('login');
});

// router.post('/login', passport.authenticate('local', {
//     successRedirect: "/tasks",
//     failureRedirect: "login",
//     successFlash: 'Welcome back!',
//     failureFlash: 'Invalid username or password.'
    
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    //   console.log('User:', user);
    if (err) { 
        console.log(err);
        return next(err); 
    }
    if (!user) {
        req.flash('error', 'Invalid username or password.');
        return res.redirect('/login'); 
    }
    req.logIn(user, function(err) {
      if (err) { 
          console.log(err);
          return next(err); 
      }
      req.flash('success', 'Welcome back, ' + user.username + '!');
      return res.redirect('/tasks');
    });
  })(req, res, next);
});

//logout
router.get('/logout', function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect('/');
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

module.exports = router;