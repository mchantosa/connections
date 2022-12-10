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
const { body, validationResult } = require("express-validator");

//const morgan = require("morgan");
//app.use(morgan("common"));

//make public directory serve static files (images, css)
app.use(express.static("public"));

//Parsing application/x-www-form-urlencoded, puts key-value pairs in req.body
app.use(express.urlencoded({ extended: false }));

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

//Use flash messaging
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
    res.locals.activePage = 'home';
    res.render("home");
});

app.get("/login", 
  mootForAuthenticated, 
  (req, res) => {
    res.locals.activePage='login';
    res.render("login");
});

app.post("/login", 
  mootForAuthenticated, 
  catchError(async (req, res) => {
    let userId=req.body.userId.trim();
    //let username = req.body.username.trim();
    //let email = req.body.email.trim();
    let password = req.body.password.trim();
    res.locals.loginId=userId;

    let username = await res.locals.store.authenticate(userId, password);
    if (!username) {
      req.flash("error", "Your credentials were invalid, please try again.");
      res.locals.activePage = 'login';
      res.render("login", {
        flash: req.flash(),
      });
    } else {
      signIn(req, username)
      res.redirect("/user/home");
    }
}));

app.post("/register", 
  mootForAuthenticated,
  [
    body("password")
      .trim()
      .isLength({ min: 8})
      .withMessage("Passwords must have a minimum of 8 characters")
      .isLength({ max: 32})
      .withMessage("Passwords can have a maximum of 32 characters")
      .matches(/^(?=.*[0-9])/)
      .withMessage("Password requires a number")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])/)
      .withMessage("Password requires a lowercase and upper case letter")
      .matches(/^(?=.*[*.!@$%^&(){}\[\]~])/)
      .withMessage("Password requires a special character: *.!@$%^&(){}[]~"),
    body("username")
      .trim()
      .isLength({ min: 8})
      .withMessage("Usernames must have a minimum of 8 characters")
  ],
  catchError(async (req, res) => {
    let username = req.body.username.trim();
    let email = req.body.email.trim();
    let password = req.body.password.trim();
    let passwordConfirm = req.body.password_confirm.trim();

    let existsUsername = await res.locals.store.existsUsername(username);
    let existsEmail = await res.locals.store.existsEmail(email);
    let errors = validationResult(req);
    res.locals.registerUsername=username;
    res.locals.registerEmail=email;
    if(existsUsername) {
      req.flash("error", "This username is already associated with an account")
      res.locals.activePage = 'login';
      res.render("login", {
        flash: req.flash(),
      });
    } else if(existsEmail) {
      req.flash("error", "This email is already associated with an account")
      res.locals.activePage = 'login';
      res.render("login", {
        flash: req.flash(),
      });
    } else if(!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      res.locals.activePage = 'login';
      res.render("login", {
        flash: req.flash(),
      });
    } else if (password !== passwordConfirm) {
      req.flash("error", "Your password and confirmation password do not match")
      res.locals.activePage = 'login';
      res.render("login", {
        flash: req.flash(),
      });
    } else {
      await res.locals.store.addUser(username, email, password); 
      signIn(req, username)
      res.locals.activePage = 'user_home';
      res.redirect('/user/home');
    }
}));

app.post("/logout", (req, res) => {
  signOut(req);
  req.flash("info", "You have logged out of the application");
  res.redirect("/home");
});

app.get("/home/how-it-works",
  (req, res) => {
    res.render("home/how-it-works");
});

app.get("/user/home",
  requiresAuthentication,
  catchError(async (req, res) => {
    if(req.session.signedIn) {
      res.locals.activePage = 'userHome';
      res.locals.userNames = await res.locals.store.getUserNames(req.session.username);
      res.locals.existsContacts = await res.locals.store.existsContacts(req.session.username);
      res.render("user/home");
    } else(res.redirect("/home"))
}));

app.get("/user/account",
  requiresAuthentication,
  catchError(async (req, res) => {
    let username = req.session.username;
    if(req.session.signedIn) {
      res.locals.activePage = 'account';
      res.locals.userData = await res.locals.store.getUserData(username);
      res.render("user/account");
    } else(res.redirect("/home"))
}));

app.get("/user/account/update-email",
  requiresAuthentication,
  catchError(async (req, res) => {
    let username = req.session.username;
    if(req.session.signedIn) {
      res.locals.userData = await res.locals.store.getUserData(username);
      res.render("user/account/update-email");
    } else(res.redirect("/home"))
}));

app.get("/user/account/update-account-information",
  requiresAuthentication,
  catchError(async (req, res) => {
    let username = req.session.username;
    if(req.session.signedIn) {
      res.locals.userData = await res.locals.store.getUserData(username);
      res.render("user/account/update-account-information");
    } else(res.redirect("/home"))
}));

app.get("/user/contacts",
  requiresAuthentication,
  catchError(async (req, res) => {
    if(req.session.signedIn) {
      res.locals.activePage = 'contacts';
      //res.local.email=req.session.username;
      //res.locals.userNames = await res.locals.store.getUserNames(req.session.username);
      //res.locals.existsContacts = await res.locals.store.existsContacts(req.session.username);
      res.render("user/contacts");
    } else(res.redirect("/home"))
}));

// Listener
app.listen(port, host, () => {
  console.log(`listening on port ${port} of ${host}!`);
});