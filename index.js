const express = require("express");
const session = require("express-session");
const store = require("connect-loki");
const app = express(); 
const host = "localhost";
const port = 3000;
const LokiStore = store(session);
const ConnectionsDB = require("./lib/connections-db");
const catchError = require("./lib/catch-error")//async error wrapped
const flash = require("express-flash");
const WELCOME_MESSAGE = "Welcome, how's life, the universe, and everything?"

//const morgan = require("morgan");

const { body, validationResult } = require("express-validator");

//app.use(morgan("common"));
//app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));// for parsing application/x-www-form-urlencoded, puts key-value pairs in req.body

//Configure session handling
app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days in millseconds
    path: "/",
    secure: false,
  },
  name: "contact-manager-application",
  resave: false,
  saveUninitialized: true,
  secret: "this is not very secure",  //this should be injected later
  store: new LokiStore({}),
}));

//Create database interface
app.use((req, res, next) => {
  res.locals.store = new ConnectionsDB(req.session);
  next();
});

app.use(flash());

//Extract session info
app.use((req, res, next) => {
  res.locals.flash = req.session.flash; 
  res.locals.username = req.session.username;
  res.locals.signedIn = req.session.signedIn;
  delete req.session.flash; 
  next();
});

app.set("views", "./views");
app.set("view engine", "pug");

const requiresAuthentication = (req, res, next) => {
  if (!res.locals.signedIn) {
    res.redirect(302, "/home");
  } else {
    next();
  }
};

const mootForAuthenticated = (req, res, next) => {
  if (res.locals.signedIn) {
    res.redirect(302, "/user/home");
  } else {
    next();
  }
};

const signIn = (req, username) => {
  req.session.username = username;
  req.session.signedIn = true;
};

const signOut = (req) => {
  delete req.session.username;
  delete req.session.signedIn;
};

app.get("/", 
  requiresAuthentication,
  (req, res) => {
    res.redirect("/user/home");
});

app.get("/home",
  (req, res) => {
    res.render("home");
});

app.get("/login", 
  mootForAuthenticated, 
  (req, res) => {
    res.render("login")
});

app.post("/login", 
  mootForAuthenticated, 
  catchError(async (req, res) => {
    let username = req.body.email.trim();
    let password = req.body.password.trim();

    let authenticated = await res.locals.store.authenticate(username, password);
    if (!authenticated) {
      req.flash("error", "Your credentials were invalid, please try again.");
      res.render("login", {
        flash: req.flash(),
      });
    } else {
      req.flash("info", WELCOME_MESSAGE);
      signIn(req, username)
      res.redirect("/user/home");
    }
}));

app.get("/register", 
  mootForAuthenticated, 
  (req, res) => {
    res.render("register");
});

app.post("/register", 
  mootForAuthenticated,
  /*[
    body("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Passwords must have a minimum of 8 characters"),
  ],*/
  catchError(async (req, res) => {
    let username = req.body.email.trim();
    let password = req.body.password.trim();
    let passwordConfirm = req.body.password_confirm.trim();

    let existsUsername = await res.locals.store.existsUsername(username);
    console.log(existsUsername)
    if(existsUsername) {
      console.log("I am here")
      req.flash("error", "This email is already associated with an account, please choose a different email or conduct a password recovery")
      res.render("register", {
        flash: req.flash(),
      });
    } else if (password !== passwordConfirm) {
      req.flash("error", "Your password and confirmation password do not match")
      res.render("register", {
        flash: req.flash(),
      });
    } else {
      await res.locals.store.addUser(username, password);
      req.flash("info", WELCOME_MESSAGE);
      signIn(req, username)
      res.render("user/home", {
        flash: req.flash(),
      });
    }
}));

app.post("/logout", (req, res) => {
  signOut(req);
  flash("info", "You have logged out of the application")
  res.redirect("/home");
});

app.get("/user/home",
  requiresAuthentication,
  (req, res) => {
    if(req.session.signedIn) res.render("user/home");
    else(res.redirect("/home"))
});

// Listener
app.listen(port, host, () => {
  console.log(`listening on port ${port} of ${host}!`);
});