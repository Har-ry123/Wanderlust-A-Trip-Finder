if(process.env.NODE_ENV !="production"){
    require('dotenv').config(); 
}
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});


const express = require("express");
const app = express();

app.get('/favicon.ico', (req, res) => res.status(204).send());

const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport= require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

main();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET || "mysupersecretcode"
    },
    touchAfter: 24*3600,
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE:", err);
});

const sessionOptions = {
    store,
    secret: process.env.SESSION_SECRET || "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    req.session.initialized = true;
    res.redirect("/listings");
});
app.use((req, res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async(req,res) =>{
//     let fakeUser =new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//       let registeredUser = await User.register(fakeUser, "helloworld");
//       res.send(registeredUser);
// });

console.log("Checking listingsRouter");
app.use("/listings", listingsRouter);
app.use("/listings/:listingId/reviews", reviewsRouter);
app.use("/", userRouter);

// Test Session Route
/*app.get("/testsession", (req, res) => {
    req.session.test = "Session created!"; // Modify session to ensure cookie is set
    console.log("Test Session Route: req.session", req.session);
    res.send("Session test route visited. Check console and cookies.");
});
*/

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message= "Something went wrong!"}= err;
   res.status(statusCode).render("error.ejs", {message});
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
