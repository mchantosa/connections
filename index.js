const express = require("express");
const session = require("express-session");
const store = require("connect-loki");
const app = express(); 
const host = "localhost";
const port = 3000;
const LokiStore = store(session);
const ConnectionsDB = require("./lib/connections-db");
const catchError = require("./lib/catch-error")//async error wrapper
const flash = require("express-flash");

//const morgan = require("morgan");

//const { body, validationResult } = require("express-validator");

//app.use(morgan("common"));
//app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));// for parsing application/x-www-form-urlencoded, puts key-value pairs in req.body
app.set("views", "./views");
app.set("view engine", "pug");

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

//Extract session info
app.use((req, res, next) => {
  res.locals.username = req.session.username;
  res.locals.signedIn = req.session.signedIn;
  console.log(res.locals.username);
  console.log(res.locals.signedIn);
  next();
});

//Detect unauthorized access
/*const requiresAuthentication = (req, res, next) => {
  if (!res.locals.signedIn) {
    res.redirect(302, "/login");
  } else {
    next();
  }
};*/

app.get("/login", (req, res) => {
  res.render("login");
});

// Handle Sign In form submission
app.post("/login", catchError(async (req, res) => {
  let username = req.body.email.trim();
  let password = req.body.password.trim();

  let authenticated = await res.locals.store.authenticate(username, password);
  if (!authenticated) {
    res.render("login");
  } else {
    req.session.username = username;
    req.session.signedIn = true;
    res.redirect("/objectives");
  }
}));

/*app.post("logout", (req, res) => {
  delete req.session.username;
  delete req.session.signedIn;
  res.redirect("/logout");
});*/

// Redirect start page
app.get("/", (req, res) => {
  res.redirect("/objectives");
});

// Render the user profile
app.get("/account", (req, res) => {
  res.render("account");
});

// Render the user profile
app.get("/objectives", (req, res) => {
  res.render("objectives");
});


app.get("/contacts", (req, res) => {
  res.render("contacts");
});


app.get("/register", (req, res) => {
  res.render("register");
});

// Listener
app.listen(port, host, () => {
  console.log(`listening on port ${port} of ${host}!`);
});