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
const { render } = require("pug");
const moment = require('moment'); 
const Objective = require("./lib/objective");
const Contact = require("./lib/contact");

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

app.get("/home/how-it-works",
  (req, res) => {
    res.render("home/how-it-works");
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

app.get("/user/home",
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.activePage = 'userHome';
    res.locals.userNames = await res.locals.store.getUserNames();
    res.locals.existsContacts = await res.locals.store.existsContacts();
    res.render("user/home");
}));

app.get("/user/account",
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.activePage = 'account';
    res.locals.userData = await res.locals.store.getUserData();
    res.render("user/account");
}));

app.get("/user/account/update-email",
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.userData = await res.locals.store.getUserData();
    res.render("user/account/update-email");
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
      res.locals.userData = await res.locals.store.getUserData();
      res.locals.userData.newEmail = newEmail; 
      res.render("user/account/update-email", {
        flash: req.flash(),
      });
    } else {
      let updated = await res.locals.store.updateUseremail(newEmail);
      if(updated){
        req.flash("info", "Your email has been updated");
      }
      res.redirect("/user/account");
    }
}));

app.get("/user/account/update-username",
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.userData = await res.locals.store.getUserData();
    res.render("user/account/update-username");
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
      res.locals.userData = await res.locals.store.getUserData();
      res.locals.userData.newUsername = newUsername; 
      res.render("user/account/update-username", {
        flash: req.flash(),
      });
    } else if (existsUsername) {
      req.flash("error", "This username unavailable");
      res.locals.userData = await res.locals.store.getUserData();
      res.locals.userData.newUsername = newUsername; 
      res.render("user/account/update-username", {
        flash: req.flash(),
      });
    } else {
      let updated= await res.locals.store.updateUsername(newUsername);
      if(updated) {
        signIn(req, newUsername);
        req.flash("info", "Your username has been updated");
      }
      res.redirect("/user/account");
    }
}));

app.get("/user/account/reset-password",
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.userData = await res.locals.store.getUserData();
    res.render("user/account/reset-password");
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
      await res.locals.store.updateUserPassword(newPassword);
      req.flash("info", "Your password has been updated")
      res.redirect("/user/account");
    }
}));

app.get("/user/account/update-account-information",
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.userData = await res.locals.store.getUserData();
    res.render("user/account/update-account-information");
}));

app.post("/user/account/update-account-information",
  requiresAuthentication,
  catchError(async (req, res) => {
    let firstName = req.body.firstName.trim();
    let lastName = req.body.lastName.trim();
    await res.locals.store.updateUserData(firstName, lastName);
    res.redirect("/user/account");
}));

app.get("/user/contacts",
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.activePage = 'contacts';
    res.locals.contactVehicle = new Contact();
    res.locals.contacts = await res.locals.store.getContacts();
    res.render("user/contacts");
}));

app.get("/user/contacts/:contact_id",
  requiresAuthentication,
  catchError(async (req, res) => {
    let contactId = req.params.contact_id;
    res.locals.contact = Contact.makeContact(
      await res.locals.store.getContact(contactId));
    res.render("user/contacts/contact-id");
}));

app.get("/user/contacts/:contact_id/edit",
  requiresAuthentication,
  catchError(async (req, res) => {
    let contactId = req.params.contact_id;
    res.locals.contact = Contact.makeContact(
      await res.locals.store.getContact(contactId));
    res.render("user/contacts/edit");
}));

app.post("/user/contacts/:contact_id/edit",
  requiresAuthentication, [
    body("firstName")
    .trim()
    .isLength({ max: 25})
    .withMessage("First Name cannot exceed 25 characters"),
    body("lastName")
    .trim()
    .isLength({ max: 25})
    .withMessage("Last Name cannot exceed 25 characters")
  ],
  catchError(async (req, res) => {
    let contactId = req.params.contact_id;

    let contact = Contact.makeContact(
      {
        id : contactId,
        first_name : req.body.firstName,
        last_name : req.body.lastName,
        preferred_medium : req.body.preferredMedium,
        phone_number : req.body.phone,
        email : req.body.email,
        street_address_1 : req.body.streetAddress1,
        street_address_2 : req.body.streetAddress2,
        city : req.body.city,
        state_code : req.body.state,
        zip_code : req.body.zipCode,
        country : req.body.country,
        notes : req.body.notes,
      },
      await res.locals.store.getObjectives(contactId));

    let errors = validationResult(req);
    let errorsCustom = [];
    if(!contact.getName()){
      errorsCustom.push("A contact name is required, please enter either a first or last name")
    }
    if(!errors.isEmpty()||errorsCustom.length) {
      errors.array().forEach(message => req.flash("error", message.msg));
      errorsCustom.forEach(message => req.flash("error", message));
      res.locals.contact = contact;
      res.render('user/contacts/edit',{
        flash: req.flash(),
      })
    } else{
      req.flash("info", `${contact.getName()} changes were saved`)
      res.redirect(`/user/contacts/${contactId}`);
    }

   
}));

app.post("/user/contacts/:contact_id/delete",
  requiresAuthentication,
  catchError(async (req, res) => {
    let contactId = req.params.contact_id;
    let contactVehicle = new Contact();
    contactVehicle.mount(await res.locals.store.getContact(contactId));
    let contactName = contactVehicle.getName();
    res.locals.contact = await res.locals.store.removeContact(contactId);
    req.flash("info", `Contact ${contactName} has been deleted`)
    res.redirect("/user/contacts/edit");
}));

app.post("/user/contacts/edit/:contact_id/objective",
  requiresAuthentication,
  [
    body("firstName")
    .trim()
    .isLength({ max: 25})
    .withMessage("First Name cannot exceed 25 characters"),
    body("lastName")
    .trim()
    .isLength({ max: 25})
    .withMessage("Last Name cannot exceed 25 characters")
  ],
  catchError(async (req, res) => {
    let contact = {};
    contact.id = req.params.id;
    contact.first_name = req.body.firstName.trim();
    contact.last_name = req.body.lastName.trim();
    contact.periodicity = req.body.periodicity;
    contact.birthday = req.body.birthday.trim();
    contact.preferred_medium = req.body.preferredMedium;
    contact.phone_number = req.body.phone;
    contact.streetAddress1 = req.body.streetAddress1.trim();
    contact.streetAddress2 = req.body.streetAddress2.trim();
    contact.city = req.body.city.trim();
    contact.state_code = req.body.state;
    contact.zip_code = req.body.zipCode.trim();
    contact.country = req.body.country.trim();
    contact.notes = req.body.notes.trim();   

    let errors = validationResult(req);
    if(!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      res.locals.contactData = await res.locals.store.getAContactData(contact.id);
      res.render("user/contacts/edit", {
        flash: req.flash(),
      });
    } else if([contact.first_name, contact.last_name].join('').length === 0){
      req.flash("error", "A contact name is required, please enter either a first or last name");
      res.render("user/contacts/edit", {
        flash: req.flash(),
      });
    }
    let errorArr = []; 
    
    let birthday = contact.birthday;
    if (birthday.split('/').length === 3) birthday = birthday.split('/');
    else birthday = birthday.split('-');
    if(![2, 3].includes(birthday.length)){
      errorArr.push("Birthday must be of format YYYY-MM-DD, YY-MM-DD, or MM-DD");
    } 
    //if(contact.birthday.split('/').length === 3){
      //let birthday = contact.birthday.split('/');
      //let errors = [];
      //let [year, month, day] = [parseInt(birthday[0]), 
      //  parseInt(birthday[1]), 
      //  parseInt(birthday[2])];
      //if(month < 1 || month > 12) errors.push("Invalid MM, month must be an integer between 1 and 12")
      //if(day < 1 || day > 31) errors.push("Invalid DD, day must be an integer between 1 and 31")
      //if(day > 29 && month === 2) errors.push("Invalid date, February cannot have more that 20 days")
      //if(day === 31 && [4,6,9,11].includes(day))errors.push("Invalid DD, April, June, September, and November have 30 days")

    console.log(req.body)
    console.log('hello')
    res.redirect("/user/contacts");
  
}));

// Listener
app.listen(port, host, () => {
  console.log(`listening on port ${port} of ${host}!`);
});