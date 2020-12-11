const express = require('express');
// const app = express();

const router = express.Router();
const Guest = require('../models/guest');
const middleware = require('../middleware/index');

const guestsArray = [
    {
        _id: '12342342',
        name: 'Asyrul Hafetzy',
        count: 2,
        remarks: 'He is coming alone',
        status: 'Confirmed'
    },
    {
        _id: '1234234a',
        name: 'Mohd Hakim',
        count: 3,
        remarks: '2 adult 1 child',
        status: 'Confirmed'
    },
    {
        _id: '1234234b',
        name: 'Lutfi Che Haron',
        count: 2,
        remarks: '2 adults',
        status: 'not sure'
    },
]

const tempGuestlistExcel = "https://1drv.ms/x/s!Ap8-akX_lVsOcOzCOC2f0KXVHNA";

router.get('/', function(req, res){
    // res.send('Guestlist PAGE!');
    // res.render('guestlist/show', {list : guestsArray, tempList: tempGuestlistExcel});
    
    Guest.find({}, function(err, allGuests){
        if(err){
            console.log(err);
            req.flash('error', 'Something went wrong!');
            res.redirect('/tasks');
        }else{
            let total = 0;
            
            allGuests.forEach(function(guest){
                total = total + guest.count;
            });
            
            res.render('guestlist/show', {list: allGuests, tempList:tempGuestlistExcel, total:total});
        }
    });
});

// insert new guest
router.post('/', middleware.isLoggedIn, function(req, res){
    
    var newGuest = {
        name: req.sanitize(req.body.guestname).trim(),
        count: req.body.count,
        remarks: req.sanitize(req.body.remarks),
        status: req.body.status,
    }
    
    Guest.create(newGuest, function(err, added){
         if(err){
            console.log(err.message);
            req.flash('error', err.message.slice(30));
            res.redirect('/guestlist');
        }else{
            req.flash('success', 'New guest successfully added!');
            res.redirect("/guestlist"); //redirect is URL path, but render is the FILE path 
        }
    });
});

//edit form
router.get('/:id/edit', middleware.isLoggedIn ,function(req, res){
    // res.send('This is the edit router for guest id ' + req.params.id + '!');
    // res.render('guestlist/edit' , {guestID: req.params.id});
    
    Guest.findById(req.params.id, function(err, foundGuest){
        if(err|| !foundGuest){
            console.log(err);
            // req.flash('error', err.message);
            req.flash('error', 'No such guest is found!');
            res.redirect('/guestlist');
        }else{
            res.render('guestlist/edit', {guest: foundGuest});
        }
    });
});

//update logic
router.put('/:id', middleware.isLoggedIn, function(req, res){
    const updatedGuestTemp = req.body.guest;
    // console.log('Updated Guest: ', updatedGuest );
    // res.redirect('/guestlist');
    const updatedGuest = {
        name: req.sanitize(updatedGuestTemp.name).trim(),
        count: updatedGuestTemp.count,
        remarks: req.sanitize(updatedGuestTemp.remarks),
        status: updatedGuestTemp.status,
    }
    
    Guest.findByIdAndUpdate(req.params.id, updatedGuest, function(err, updatedSuccess){
        if(err || !updatedSuccess){
            console.log(err);
            req.flash('error', 'Something went wrong while updating!');
        }else{
            req.flash('success', 'Successfully updated guest!');
            res.redirect('/guestlist');
        }
    });
});

router.delete('/:id', middleware.isLoggedIn, function(req, res){
    // res.send('DELETE ROUTE!');
     Guest.findByIdAndRemove(req.params.id, function(err, foundGuest){
        if(err || !foundGuest){
            req.flash('error', 'Something went wrong while deleting!');
            res.redirect('/guestlist');
        }else{
            req.flash('success', 'Successfully removed guest!');
            res.redirect('/guestlist');
        }
    });
});


//Search
router.post('/search', function(req, res){
    // res.send('You Searched for:' + req.body.search);
    
    const searchItem = req.sanitize(req.body.search).trim();
    // console.log('Search item:', searchItem);
    // res.redirect('/guestlist');
    
    
    Guest.find({}, function(err, allGuests){
        if(err){
            console.log(err);
        }else{
            let total = 0;
            
            allGuests.forEach(function(guest){
                total = total + guest.count;
            });
            
            // Guest.find({name : searchItem}, function(err, foundGuests){
            Guest.find({name :  { 
                                    $regex: new RegExp(searchItem, 'i')}
                                }, function(err, foundGuests){
                if(err){
                    console.log(err);
                }else{
                    // console.log('found:', foundGuests);
                    res.render('guestlist/show', { list: foundGuests, tempList:tempGuestlistExcel, total: total});
                }
            });
        }
    });
});

// sort alpha
router.get('/sort', function(req, res){
    // res.send('You Searched for:' + req.body.search);
    
    // const searchItem = req.sanitize(req.body.search).trim();
    // console.log('Search item:', searchItem);
    // res.redirect('/guestlist');
    
    
    Guest.find({}, [], {sort: {name: 1}}, function(err, allGuestsSorted){
        if(err){
            console.log(err);
        }else{
            let total = 0;
            
            allGuestsSorted.forEach(function(guest){
                total = total + guest.count;
            });
             
            res.render('guestlist/show', { list: allGuestsSorted, tempList:tempGuestlistExcel, total: total});
        }
    });
});

router.get('/exportcsv', function(req, res){
    res.send("Export to CSV Route!");
});

module.exports = router;