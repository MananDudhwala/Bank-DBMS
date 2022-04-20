//jshint esversion: 6

require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");
const mongoose = require("mongoose");
const app = express();
const session = require('express-session');
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const findOrCreate = require('mongoose-findorcreate');

mongoose.connect("mongodb://localhost:27017/bankDB");
//mongoose.set("useCreateIndex", true);
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    age: Number,
    username: String,
    balance: Number
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema)
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));



app.get('/',function(req,res){
    res.render('home')
});
app.get('/register',function(req,res){
    res.render('register')
});
app.post("/register", function(req, res) {

    const newUser = new User({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        name: req.body.fullname,
        age: req.body.age,
        balance: 1000
    });

    newUser.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.render("account",{user:newUser});
        }
    });



})
app.get('/login',function(req,res){
    res.render('login')
});
app.post('/login', function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email }, function(err, foundUser) {
        if(err)
        {
            console.log(err)
        }
        else
        {
            if(foundUser)
            {
                if(foundUser.password === password)
                {
                    res.render("account",{user:foundUser})
                }
            }
        }
})
});
app.get('/account',function(req,res){
    res.render("deposit")
});

app.post('/account',function(req,res){

    const email = req.body.email;
    User.findOne({ email: email }, function(err, foundUserr) {
        if(err)
        {
            console.log(err)
        }
        else
        {
            if(foundUserr)
            {
                res.render('deposit',{user:foundUserr})
            }
        }
})


     
});

app.post('/daccount',function(req,res){

    const amonunt = req.body.amt;
    const email = req.body.email;

    User.findOne({ email: email }, function(err, foundUserr) {
        if(err)
        {
            console.log(err)
        }
        else
        {
            if(foundUserr)
            {
                foundUserr.balance = Number(foundUserr.balance) + Number(amonunt);
                foundUserr.save();
                res.render('account',{user:foundUserr})
            }
        }
});


});

app.get('/logout', function(req, res) {
    res.redirect('/');
});

app.post('/withdraw',function(req,res){

    const email = req.body.email;
    User.findOne({ email: email }, function(err, foundUserr) {
        if(err)
        {
            console.log(err)
        }
        else
        {
            if(foundUserr)
            {
                res.render('withdraw',{user:foundUserr})
            }
        }
})

});
app.post('/waccount',function(req,res){

    const amonunt = req.body.amt;
    const email = req.body.email;

    User.findOne({ email: email }, function(err, foundUserr) {
        if(err)
        {
            console.log(err)
        }
        else
        {
            if(foundUserr)
            {
                foundUserr.balance = Number(foundUserr.balance) - Number(amonunt);
                foundUserr.save();
                res.render('account',{user:foundUserr})
            }
        }


});
});



app.listen(3000, function() {
    console.log("Server started on port 3000");
});