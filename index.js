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
    let password = req.body.password.trim();
    res.locals.userId=userId;

    let userCridentials = await res.locals.store.getUserCredentials(userId);
    let username = (userCridentials)? userCridentials.username: false;
    let authenticated = await res.locals.store.authenticate(username, password);
  
    if (!username || !authenticated) {
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
      .matches(/^((?!@).)*$/)
      .withMessage("Username cannot contain an @ symbol")
  ],
  catchError(async (req, res) => {
    let username = req.body.username.trim();
    let email = req.body.email.trim();
    let password = req.body.password.trim();
    let confirmPassword = req.body.confirmPassword.trim();

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
    } else if (password !== confirmPassword) {
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
    let username = req.session.username;
    res.locals.activePage = 'userHome';
    res.locals.userNames = await res.locals.store.getUserNames(username);
    res.locals.existsContacts = await res.locals.store.existsContacts(username);
    res.render("user/home");
}));

app.get("/user/account",
  requiresAuthentication,
  catchError(async (req, res) => {
    let username = req.session.username;
    res.locals.activePage = 'account';
    res.locals.userData = await res.locals.store.getUserData(username);
    res.render("user/account");
}));

app.get("/user/account/update-email",
  requiresAuthentication,
  catchError(async (req, res) => {
    let username = req.session.username;
    res.locals.userData = await res.locals.store.getUserData(username);
    res.render("user/account/update-email");
}));

app.get("/user/account/update-username",
  requiresAuthentication,
  catchError(async (req, res) => {
    let username = req.session.username;
    res.locals.userData = await res.locals.store.getUserData(username);
    res.render("user/account/update-username");
}));

app.get("/user/account/update-account-information",
  requiresAuthentication,
  catchError(async (req, res) => {
    let username = req.session.username;
    res.locals.userData = await res.locals.store.getUserData(username);
    res.render("user/account/update-account-information");
}));

app.get("/user/account/reset-password",
  requiresAuthentication,
  catchError(async (req, res) => {
    let username = req.session.username;
    res.locals.userData = await res.locals.store.getUserData(username);
    res.render("user/account/reset-password");
}));

app.post("/user/account/update-account-information",
  requiresAuthentication,
  catchError(async (req, res) => {
    let username = req.session.username;
    let firstName = req.body.firstName.trim();
    let lastName = req.body.lastName.trim();
    await res.locals.store.updateUserData(username, firstName, lastName);
    res.redirect("/user/account");
}));

app.post("/user/account/reset-password",
  requiresAuthentication,
  [
    body("newPassword")
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
      .withMessage("Password requires a special character: *.!@$%^&(){}[]~")
  ],
  catchError(async (req, res) => {
    let username = req.session.username;
    let password = req.body.password.trim();
    let newPassword = req.body.newPassword.trim();
    let confirmPassword = req.body.confirmPassword.trim();
    let errors = validationResult(req);
    let passwordAuthenticated = await res.locals.store.authenticate(username, password);
    if(!passwordAuthenticated){
      req.flash("error", "Your password does not match our records");
      res.redirect("/user/account/reset-password");
    }
    else if(!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      res.redirect("/user/account/reset-password");
    } else if (newPassword !== confirmPassword) {
      req.flash("error", "Your password and confirmation password do not match")
      res.redirect("/user/account/reset-password");
    } else {
      await res.locals.store.updateUserPassword(username, newPassword);
      req.flash("info", "Your password has been updated")
      res.redirect("/user/account");
    }
}));

app.post("/user/account/update-email",
  requiresAuthentication,
  catchError(async (req, res) => {
    let username = req.session.username;
    let newEmail = req.body.email.trim();
    let userCredentials = await res.locals.store.getUserCredentials(username);
    let email = userCredentials.email;
    let existsEmail = await res.locals.store.existsEmail(newEmail);
    if(email === newEmail) {
      req.flash("info", "Your updated email matched your existing email, your email was not updated")
      res.redirect("/user/account");
    } else if (existsEmail) {
      req.flash("error", "This email is already associated with an account");
      res.locals.userData = await res.locals.store.getUserData(username);
      res.locals.userData.newEmail = newEmail; 
      res.render("user/account/update-email", {
        flash: req.flash(),
      });
    } else {
      let updated = await res.locals.store.updateUseremail(username, newEmail);
      if(updated){
        req.flash("info", "Your email has been updated");
      }
      res.redirect("/user/account");
    }
}));

app.post("/user/account/update-username",
  requiresAuthentication,
  [
    body("username")
    .trim()
    .isLength({ min: 8})
    .withMessage("Usernames must have a minimum of 8 characters")
    .matches(/^((?!@).)*$/)
    .withMessage("Username cannot contain an @ symbol")
  ],
  catchError(async (req, res) => {
    let username = req.session.username;
    let newUsername = req.body.username.trim();
    let existsUsername = await res.locals.store.existsUsername(newUsername);
    let errors = validationResult(req);
    if(username === newUsername) {
      req.flash("info", "Your updated username matched your existing username, your username was not updated")
      res.redirect("/user/account");
    } else if(!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      res.locals.userData = await res.locals.store.getUserData(username);
      res.locals.userData.newUsername = newUsername; 
      res.render("user/account/update-username", {
        flash: req.flash(),
      });
    } else if (existsUsername) {
      req.flash("error", "This username unavailable");
      res.locals.userData = await res.locals.store.getUserData(username);
      res.locals.userData.newUsername = newUsername; 
      res.render("user/account/update-username", {
        flash: req.flash(),
      });
    } else {
      let updated= await res.locals.store.updateUsername(username, newUsername);
      if(updated) {
        signIn(req, newUsername);
        req.flash("info", "Your username has been updated");
      }
      res.redirect("/user/account");
    }
}));

app.get("/user/contacts",
  requiresAuthentication,
  catchError(async (req, res) => {
    let username = req.session.username;
    res.locals.activePage = 'contacts';
    res.locals.contactData = await res.locals.store.getContactData(username);
    console.log("ContactData: " + res.locals.contactData)
    res.render("user/contacts");
}));

app.get("/user/contacts/edit/:id",
  requiresAuthentication,
  catchError(async (req, res) => {
    let id = req.params.id;
    res.locals.contactData = await res.locals.store.getAContactData(id);
    res.render("user/contacts/edit");
}));

// Listener
app.listen(port, host, () => {
  console.log(`listening on port ${port} of ${host}!`);
});