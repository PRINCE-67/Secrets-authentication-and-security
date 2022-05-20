//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

// creates a session
app.use(session({
  secret:"princeisawesomealways.",
  resave: false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//it does hashing and salting and saving the users into out databases.
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

//creating the strategies for our user
passport.use(User.createStrategy());

//ceating the fortune cookie and stuffing with user credentials
passport.serializeUser(User.serializeUser());
//destroying the cookie
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  res.render("home.ejs");
});

app.get("/login", function(req, res) {
  res.render("login.ejs");
});

app.get("/register", function(req, res) {
  res.render("register.ejs");
});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets.ejs");
  }
  else{
    res.redirect("/login");
  }
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res) {
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      // create a cookie and save their session as logged-in.
      // authenticate means to get one's identity verified.
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req, res) {
  const user=new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user,function(err){
    if(err)
    console.log(err);
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});


app.listen("3000", function() {
  console.log("server started on port 3000");
});
