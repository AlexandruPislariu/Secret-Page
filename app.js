let passport        = require("passport");
const express       = require("express");
const mongoose      = require("mongoose");
const bodyParser    = require("body-parser");
let LocalStrategy       = require("passport-local");
let passportLocalMongoose = require("passport-local-mongoose");
let User = require("./models/user");

mongoose.connect("mongodb://localhost:27017/auth_demo_app",
{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to DB!"))
.catch(error => console.log(error.message));
const app = express();
app.set("view engine", "ejs");
app.use(require("express-session")({
    secret: "Gym training",
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ROUTES
app.get("/", (req, res) =>{

    res.render("home");
});

app.get("/secret", isLoggedIn, (req, res) =>{

    res.render("secret");
});

// Auth routes
app.get("/register", (req, res) => 
{
    res.render("register");

});

app.post("/register", (req, res) =>
{
   User.register(new User({username: req.body.username}), req.body.password, (error, user) => {

        if(error)
        {
            console.log(error);
            res.render("register");
        }
        passport.authenticate("local")(req, res, () =>
        {
            res.redirect("/secret");
        });   
   });
});

// Login routes
// render login form
app.get("/login", (req, res) => {

    res.render("login");
});
// login logic
app.post("/login", passport.authenticate("local" ,{
    successRedirect: "/secret",
    failureRedirect: "/login"
}),(req, res) =>
{

});

app.get("/logout", (req, res) => 
{
    // Passport no longer keep track of this user
    req.logout();
    res.redirect("/");
});

// middleware
function isLoggedIn(req, res, next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect("/login");
};

app.listen(3000, () =>
{
    console.log("Started at port 3000!");
});