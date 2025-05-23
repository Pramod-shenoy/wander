if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express =  require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wander";

// MongoDB Connection with retry logic
const connectWithRetry = () => {
    mongoose.connect(dbUrl)
        .then(() => {
            console.log("Connected to DB");
        })
        .catch((err) => {
            console.error("Error connecting to DB:", err);
            console.log("Retrying in 5 seconds...");
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret : process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error",(err) => {
    console.error("ERROR in MONGO SESSION STORE:", err);
});

const sessionOptions = {
    store,
    name: 'session',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

if (process.env.NODE_ENV === "production") {
    app.set('trust proxy', 1);
    sessionOptions.cookie.secure = true;
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    if(!['/login', '/signup'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Static pages routes
app.get("/privacy", (req, res) => {
    res.render("privacy");
});

app.get("/terms", (req, res) => {
    res.render("terms");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.all("*",(req,res,next) =>{
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next) =>{
    let {statusCode = 500, message = "Something went wrong!"} = err;
    if(!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render("error.ejs", { err, statusCode });
});

const port = process.env.PORT || 8080;
app.listen(port,() => {
    console.log(`Server is listening to port ${port}`);
});