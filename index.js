const express = require('express');
const session = require('express-session');// cookies
const store = require('connect-loki');// session store

const app = express();
const host = '0.0.0.0';
const port = process.env.PORT || 3000;
const LokiStore = store(session);
const flash = require('express-flash');
const { body, validationResult } = require('express-validator');
const { deleteAllContactsHandler, createContactHandler } = require('./admin-routes');
const catchError = require('./lib/catch-error');// async error wrapped
const ConnectionsDB = require('./lib/connections-db');
const Objective = require('./lib/objective');
const Connection = require('./lib/connection');
const Contact = require('./lib/contact');

const findNavVector = (page, endPage) => {
  const navVector = [page];
  let index = 1;
  while (true) {
    let fails = 0;
    if (page + index <= endPage) {
      navVector.push(page + index);
    } else fails += 1;
    if (page - index >= 0) {
      navVector.unshift(page - index);
    } else fails += 1;
    if (fails === 2) break;
    if (navVector.length >= 5) break;
    index += 1;
  }
  return navVector;
};

// make public directory serve static files (images, css)
app.use(express.static('public'));

// Parsing application/x-www-form-urlencoded, puts key-value pairs in req.body
app.use(express.urlencoded({ extended: false }));

// Configure session handling
app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days in milliseconds
    path: '/',
    secure: false,
  },
  name: 'contact-manager-application',
  resave: false,
  saveUninitialized: true,
  secret: 'this is not very secure', // this should be injected later
  store: new LokiStore({}),
}));

// Create database interface
app.use((req, res, next) => {
  res.locals.store = new ConnectionsDB(req.session);
  next();
});

// Use flash messaging
app.use(flash());

// Extract session info
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  res.locals.user = req.session.user;
  res.locals.signedIn = req.session.signedIn;
  delete req.session.flash;
  next();
});

app.set('views', './views');
app.set('view engine', 'pug');

const requiresAuthentication = (req, res, next) => {
  if (!res.locals.signedIn) {
    req.flash('error', 'You must be logged in to access that content');
    res.redirect(302, `/login?redirect=${req.originalUrl}`);
  } else {
    next();
  }
};

const mootForAuthenticated = (req, res, next) => {
  if (res.locals.signedIn) {
    res.redirect(302, '/user/home');
  } else {
    next();
  }
};

const requiresUserContactValidation = catchError(async (req, res, next) => {
  const contactId = req.params.contact_id;
  const authenticated = await res.locals.store.userOwnsContact(+contactId);
  if (!authenticated) {
    req.flash('error', 'Error loading contact');// don't want to verify contact existence
    res.redirect(302, '/user/contacts');
  } else {
    next();
  }
});

const signIn = (req, user) => {
  req.session.user = user;
  req.session.signedIn = true;
};

const signOut = (req) => {
  delete req.session.user;
  delete req.session.signedIn;
};

deleteAllContactsHandler(app);

createContactHandler(app);

app.get(
  '/',
  (req, res) => {
    res.redirect('/home');
  },
);

app.get(
  '/home',
  (req, res) => {
    res.locals.activePage = 'home';
    res.render('home');
  },
);

app.get(
  '/home/how-it-works',
  (req, res) => {
    res.render('home/how-it-works');
  },
);

app.get(
  '/login',
  mootForAuthenticated,
  (req, res) => {
    res.locals.activePage = 'login';
    res.locals.redirect = req.query.redirect;
    res.render('login');
  },
);

app.post(
  '/login',
  mootForAuthenticated,
  catchError(async (req, res) => {
    const { redirect } = req.query;
    const userCredential = req.body.userCredential.trim();
    const password = req.body.password.trim();
    res.locals.userCredential = userCredential;

    const user = await res.locals.store.getUserCredentials(userCredential);
    const id = (user) ? user.id : false;
    const authenticated = await res.locals.store.authenticate(id, password);

    if (!id || !authenticated) {
      req.flash('error', 'Your credentials were invalid, please try again.');
      res.locals.activePage = 'login';
      res.render('login', {
        flash: req.flash(),
        redirect,
      });
    } else {
      signIn(req, user);
      if (redirect) {
        res.redirect(redirect);
      } else {
        res.redirect('/user/home');
      }
    }
  }),
);

app.post(
  '/register',
  mootForAuthenticated,
  [
    body('username')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Username must have a minimum of 8 characters')
      .isLength({ max: 100 })
      .withMessage('Username cannot exceed 100 characters')
      .matches(/^((?!@).)*$/)
      .withMessage('Username cannot contain an @ symbol'),
    body('email')
      .trim()
      .isLength({ min: 1 })
      .withMessage('An email is required')
      .isLength({ max: 100 })
      .withMessage('Email cannot exceed 100 characters')
      .isEmail()
      .withMessage('Invalid Email'),
    body('password')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Passwords must have a minimum of 8 characters')
      .matches(/^(?=.*[0-9])/)
      .withMessage('Password requires a number')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])/)
      .withMessage('Password requires a lowercase and upper case letter')
      .matches(/^(?=.*[*.!@$%^&(){}[\]~])/)
      .withMessage('Password requires a special character: *.!@$%^&(){}[]~'),
  ],
  catchError(async (req, res) => {
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const confirmPassword = req.body.confirmPassword.trim();

    const existsUsername = await res.locals.store.existsUsername(username);
    const existsEmail = await res.locals.store.existsEmail(email);
    const errors = validationResult(req);
    res.locals.registerUsername = username;
    res.locals.registerEmail = email;
    if (existsUsername) {
      req.flash('error', 'This username is already associated with an account');
      res.locals.activePage = 'login';
      res.render('login', {
        flash: req.flash(),
      });
    } else if (existsEmail) {
      req.flash('error', 'This email is already associated with an account');
      res.locals.activePage = 'login';
      res.render('login', {
        flash: req.flash(),
      });
    } else if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash('error', message.msg));
      res.locals.activePage = 'login';
      res.render('login', {
        flash: req.flash(),
      });
    } else if (password !== confirmPassword) {
      req.flash('error', 'Your password and confirmation password do not match');
      res.locals.activePage = 'login';
      res.render('login', {
        flash: req.flash(),
      });
    } else {
      const user = { username, email, password };
      const added = await res.locals.store.addUser(user);
      if (added) {
        signIn(req, user);
      }
      res.locals.activePage = 'user_home';
      res.redirect('/user/home');
    }
  }),
);

app.post(
  '/logout',
  (req, res) => {
    signOut(req);
    req.flash('info', 'You have logged out of the application');
    res.redirect('/home');
  },
);

app.get(
  '/user',
  requiresAuthentication,
  (req, res) => {
    res.redirect('/user/home');
  },
);

app.get(
  '/user/home',
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.activePage = 'userHome';
    res.locals.sunday = Connection.findSunday();
    res.locals.saturday = Connection.findSaturday();
    res.locals.userNames = await res.locals.store.getUserNames();
    res.locals.existsContacts = await res.locals.store.existsContacts();
    res.render('user/home');
  }),
);

app.get(
  '/user/account',
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.activePage = 'account';
    res.locals.userData = await res.locals.store.getUserData();
    res.render('user/account');
  }),
);

app.get(
  '/user/account/update-email',
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.userData = await res.locals.store.getUserData();
    res.render('user/account/update-email');
  }),
);

app.post(
  '/user/account/update-email',
  requiresAuthentication,
  [
    body('email')
      .trim()
      .isLength({ min: 1 })
      .withMessage('An email is required')
      .isLength({ max: 100 })
      .withMessage('Email cannot exceed 100 characters')
      .isEmail()
      .withMessage('Invalid Email'),
  ],
  catchError(async (req, res) => {
    const { username } = req.session;
    const newEmail = req.body.email.trim();
    const userCredentials = await res.locals.store.getUserCredentials(username);
    const { email } = userCredentials;
    const existsEmail = await res.locals.store.existsEmail(newEmail);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash('error', message.msg));
      res.locals.userData = await res.locals.store.getUserData();
      res.locals.userData.newEmail = newEmail;
      res.render('user/account/update-email', {
        flash: req.flash(),
      });
    } else if (email === newEmail) {
      req.flash('info', 'Your updated email matched your existing email, your email was not updated');
      res.redirect('/user/account');
    } else if (existsEmail) {
      req.flash('error', 'This email is already associated with an account');
      res.locals.userData = await res.locals.store.getUserData();
      res.locals.userData.newEmail = newEmail;
      res.render('user/account/update-email', {
        flash: req.flash(),
      });
    } else {
      const updated = await res.locals.store.updateUserEmail(newEmail);
      if (updated) {
        req.flash('info', 'Your email has been updated');
      }
      res.redirect('/user/account');
    }
  }),
);

app.get(
  '/user/account/update-username',
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.userData = await res.locals.store.getUserData();
    res.render('user/account/update-username');
  }),
);

app.post(
  '/user/account/update-username',
  requiresAuthentication,
  [
    body('username')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Username must have a minimum of 8 characters')
      .isLength({ max: 100 })
      .withMessage('Username cannot exceed 100 characters')
      .matches(/^((?!@).)*$/)
      .withMessage('Username cannot contain an @ symbol'),
  ],
  catchError(async (req, res) => {
    const { username } = req.session;
    const newUsername = req.body.username.trim();
    const existsUsername = await res.locals.store.existsUsername(newUsername);
    const errors = validationResult(req);
    if (username === newUsername) {
      req.flash('info', 'Your updated username matched your existing username, your username was not updated');
      res.redirect('/user/account');
    } else if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash('error', message.msg));
      res.locals.userData = await res.locals.store.getUserData();
      res.locals.userData.newUsername = newUsername;
      res.render('user/account/update-username', {
        flash: req.flash(),
      });
    } else if (existsUsername) {
      req.flash('error', 'This username unavailable');
      res.locals.userData = await res.locals.store.getUserData();
      res.locals.userData.newUsername = newUsername;
      res.render('user/account/update-username', {
        flash: req.flash(),
      });
    } else {
      const updated = await res.locals.store.updateUsername(newUsername);
      if (updated) {
        const { user } = session;
        user.username = newUsername;
        signIn(req, user);
        req.flash('info', 'Your username has been updated');
      }
      res.redirect('/user/account');
    }
  }),
);

app.get(
  '/user/account/reset-password',
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.userData = await res.locals.store.getUserData();
    res.render('user/account/reset-password');
  }),
);

app.post(
  '/user/account/reset-password',
  requiresAuthentication,
  [
    body('newPassword')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Passwords must have a minimum of 8 characters')
      .matches(/^(?=.*[0-9])/)
      .withMessage('Password requires a number')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])/)
      .withMessage('Password requires a lowercase and upper case letter')
      .matches(/^(?=.*[*.!@$%^&(){}[\]~])/)
      .withMessage('Password requires a special character: *.!@$%^&(){}[]~'),
  ],
  catchError(async (req, res) => {
    const { username } = req.session;
    const password = req.body.password.trim();
    const { newPassword } = req.body;
    const confirmPassword = req.body.confirmPassword.trim();
    const errors = validationResult(req);
    const passwordAuthenticated = await res.locals.store.authenticate(username, password);
    if (!passwordAuthenticated) {
      req.flash('error', 'Your password does not match our records');
      res.redirect('/user/account/reset-password');
    } else if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash('error', message.msg));
      res.redirect('/user/account/reset-password');
    } else if (newPassword !== confirmPassword) {
      req.flash('error', 'Your password and confirmation password do not match');
      res.redirect('/user/account/reset-password');
    } else {
      await res.locals.store.updateUserPassword(newPassword);
      req.flash('info', 'Your password has been updated');
      res.redirect('/user/account');
    }
  }),
);

app.get(
  '/user/account/update-account-information',
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.userData = await res.locals.store.getUserData();
    res.render('user/account/update-account-information');
  }),
);

app.post(
  '/user/account/update-account-information',
  requiresAuthentication,
  [
    body('first_name')
      .trim()
      .isLength({ max: 25 })
      .withMessage('First name cannot exceed 25 characters'),
    body('last_name')
      .trim()
      .isLength({ max: 25 })
      .withMessage('Last name cannot exceed 25 characters'),
  ],
  catchError(async (req, res) => {
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash('error', message.msg));
      res.locals.userData = await res.locals.store.getUserData();
      res.locals.userData.first_name = firstName;
      res.locals.userData.last_name = lastName;
      res.render('user/account/update-account-information', {
        flash: req.flash(),
      });
    } else {
      await res.locals.store.updateUserData(firstName, lastName);
      res.redirect('/user/account');
    }
  }),
);

app.get(
  '/user/contacts',
  requiresAuthentication,
  catchError(async (req, res) => {
    const page = (req.query.page) ? +req.query.page : 0;
    const totalContacts = await res.locals.store.getContactsCount();
    const endPage = Math.floor(totalContacts / ConnectionsDB.PAGINATE);
    const navVector = findNavVector(page, endPage);

    if (Number.isNaN(page) || (page < 0) || (page > endPage)) {
      req.flash('error', `Your query parameter must be a number between 0 and ${endPage}`);
      res.redirect('/user/contacts');
    } else {
      res.locals.activePage = 'contacts';
      res.locals.page = page;
      res.locals.endPage = endPage;
      res.locals.navVector = navVector;
      res.locals.contacts = await res.locals.store.getContacts(page);
      res.render('user/contacts');
    }
  }),
);

app.get(
  '/user/contacts/create-contact',
  requiresAuthentication,
  catchError(async (req, res) => {
    res.locals.contact = new Contact();
    res.render('user/contacts/create-contact');
  }),
);

app.post(
  '/user/contacts/create-contact',
  requiresAuthentication,
  [
    body('first_name')
      .trim()
      .isLength({ max: 25 })
      .withMessage('First Name cannot exceed 25 characters'),
    body('last_name')
      .trim()
      .isLength({ max: 25 })
      .withMessage('Last Name cannot exceed 25 characters'),
    body('preferred_medium')
      .trim()
      .isLength({ max: 100 })
      .withMessage('Preferred Medium cannot exceed 100 characters'),
    body('phone_number')
      .trim().optional({ checkFalsy: true, checkNull: true })
      .matches(/^\d\d\d-\d\d\d-\d\d\d\d$/)
      .withMessage('Invalid phone number format. Use ###-###-####.'),
    body('email')
      .trim().optional({ checkFalsy: true, checkNull: true })
      .isLength({ max: 100 })
      .withMessage('Email cannot exceed 100 characters')
      .isEmail()
      .withMessage('Invalid Email'),
    body('street_address_1')
      .trim()
      .isLength({ max: 100 })
      .withMessage('Street address 1 cannot exceed 100 characters'),
    body('street_address_2')
      .trim()
      .isLength({ max: 100 })
      .withMessage('Street address 2 cannot exceed 100 characters'),
    body('city')
      .trim()
      .isLength({ max: 50 })
      .withMessage('City cannot exceed 50 characters'),
    body('state_code')
      .trim().optional({ checkFalsy: true, checkNull: true })
      .isIn([undefined, '', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
        'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA',
        'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'AS', 'GU',
        'MP', 'PR', 'UM', 'VI', 'AA', 'AP', 'AE', 'VI', 'AA', 'AP', 'AE'])
      .withMessage('Must be a valid state abbreviation'),
    body('zip_code')
      .trim().optional({ checkFalsy: true, checkNull: true })
      .custom((value) => {
        const t1 = /^[0-9]{5}$/.test(value);
        const t2 = /^[0-9]{5}-[0-9]{4}$/.test(value);
        return t1 || t2;
      })
      .withMessage('Zipcode has an invalid format. Use ##### or #####-####'),
    body('country')
      .trim()
      .isLength({ max: 25 })
      .withMessage('Country cannot exceed 25 characters'),
  ],
  catchError(async (req, res) => {
    const contactId = req.params.contact_id;
    const contact = new Contact({
      id: contactId,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      preferred_medium: req.body.preferred_medium,
      phone_number: req.body.phone_number,
      email: req.body.email,
      street_address_1: req.body.street_address_1,
      street_address_2: req.body.street_address_2,
      city: req.body.city,
      state_code: req.body.state_code,
      zip_code: req.body.zip_code,
      country: req.body.country,
      notes: req.body.notes,
    });
    const errors = validationResult(req);
    const errorsCustom = [];

    if (!contact.getName()) {
      errorsCustom.push('A contact name is required, please enter either a first or last name');
    }
    if (!errors.isEmpty() || errorsCustom.length) {
      errors.array().forEach((message) => req.flash('error', message.msg));
      errorsCustom.forEach((message) => req.flash('error', message));
      res.locals.contact = contact;
      res.render('user/contacts/create-contact', {
        flash: req.flash(),
      });
    } else {
      const updated = await res.locals.store.createContact(contact);
      if (updated) {
        req.flash('info', `${contact.getName()} was created`);
        res.redirect('/user/contacts');
      } else {
        req.flash('error', 'Your input passed validation, but something went wrong, your contact was not created');
        res.redirect('/user/contacts');
      }
    }
  }),
);

app.get(
  '/user/contacts/:contact_id',
  requiresAuthentication,
  requiresUserContactValidation,
  catchError(async (req, res) => {
    const contactId = req.params.contact_id;
    res.locals.contact = await res.locals.store.getContact(+contactId);
    res.render('user/contacts/contact-id');
  }),
);

app.get(
  '/user/contacts/:contact_id/edit',
  requiresAuthentication,
  requiresUserContactValidation,
  catchError(async (req, res) => {
    const contactId = req.params.contact_id;
    res.locals.contact = await res.locals.store.getContact(+contactId);
    res.render('user/contacts/edit');
  }),
);

app.post(
  '/user/contacts/:contact_id/edit',
  requiresAuthentication,
  requiresUserContactValidation,
  [
    body('first_name')
      .trim()
      .isLength({ max: 25 })
      .withMessage('First Name cannot exceed 25 characters'),
    body('last_name')
      .trim()
      .isLength({ max: 25 })
      .withMessage('Last Name cannot exceed 25 characters'),
    body('preferred_medium')
      .trim()
      .isLength({ max: 100 })
      .withMessage('Preferred Medium cannot exceed 100 characters'),
    body('phone_number')
      .trim().optional({ checkFalsy: true, checkNull: true })
      .matches(/^\d\d\d-\d\d\d-\d\d\d\d$/)
      .withMessage('Invalid phone number format. Use ###-###-####.'),
    body('email')
      .trim().optional({ checkFalsy: true, checkNull: true })
      .isLength({ max: 100 })
      .withMessage('Email cannot exceed 100 characters')
      .isEmail()
      .withMessage('Invalid Email'),
    body('street_address_1')
      .trim()
      .isLength({ max: 100 })
      .withMessage('Street address 1 cannot exceed 100 characters'),
    body('street_address_2')
      .trim()
      .isLength({ max: 100 })
      .withMessage('Street address 2 cannot exceed 100 characters'),
    body('city')
      .trim()
      .isLength({ max: 50 })
      .withMessage('City cannot exceed 50 characters'),
    body('state_code')
      .trim().isIn([undefined, '', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
        'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA',
        'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'AS', 'GU',
        'MP', 'PR', 'UM', 'VI', 'AA', 'AP', 'AE', 'VI', 'AA', 'AP', 'AE'])
      .withMessage('Must be a valid state abbreviation'),
    body('zip_code')
      .trim().optional({ checkFalsy: true, checkNull: true })
      .custom((value) => {
        const t1 = /^[0-9]{5}$/.test(value);
        const t2 = /^[0-9]{5}-[0-9]{4}$/.test(value);
        return t1 || t2;
      })
      .withMessage('Zipcode has an invalid format. Use ##### or #####-####'),
    body('country')
      .trim()
      .isLength({ max: 25 })
      .withMessage('Country cannot exceed 25 characters'),
  ],
  catchError(async (req, res) => {
    const contactId = req.params.contact_id;

    const contact = new Contact(
      {
        id: contactId,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        preferred_medium: req.body.preferred_medium,
        phone_number: req.body.phone_number,
        email: req.body.email,
        street_address_1: req.body.street_address_1,
        street_address_2: req.body.street_address_2,
        city: req.body.city,
        state_code: req.body.state_code,
        zip_code: req.body.zip_code,
        country: req.body.country,
        notes: req.body.notes,
      },
    );

    const errors = validationResult(req);
    const errorsCustom = [];

    if (!contact.getName()) {
      errorsCustom.push('A contact name is required, please enter either a first or last name');
    }
    if (!errors.isEmpty() || errorsCustom.length) {
      errors.array().forEach((message) => req.flash('error', message.msg));
      errorsCustom.forEach((message) => req.flash('error', message));
      res.locals.contact = contact;
      res.render('user/contacts/edit', {
        flash: req.flash(),
      });
    } else {
      const updated = await res.locals.store.updateContact(contact);
      if (updated) {
        req.flash('info', `${contact.getName()} changes were saved`);
        res.redirect(`/user/contacts/${contactId}`);
      } else {
        req.flash('error', 'Something went wrong, your input passed validation, but your changes were not updated');
        res.redirect('/user/contacts');
      }
    }
  }),
);

app.post(
  '/user/contacts/:contact_id/delete',
  requiresAuthentication,
  requiresUserContactValidation,
  catchError(async (req, res) => {
    const contactId = req.params.contact_id;
    let contactName;
    let deleted;
    const contact = await res.locals.store.getContact(+contactId);
    if (contact) {
      contactName = contact.getName();
      deleted = await res.locals.store.deleteContact(+contactId);
    }
    if (deleted) {
      req.flash('info', `${contactName} has been deleted`);
    } else {
      req.flash('error', `Something went wrong, we were unable to delete contact ${contactId}`);
    }
    res.redirect('/user/contacts');
  }),
);

app.get(
  '/user/contacts/:contact_id/objectives/create-objective',
  requiresAuthentication,
  requiresUserContactValidation,
  catchError(async (req, res) => {
    const contactId = req.params.contact_id;
    const contact = await res.locals.store.getContact(+contactId);
    if (!contact.getObjective()) {
      contact.setObjective(new Objective());
    }
    res.locals.contact = contact;
    res.render('user/contacts/objectives/create-objective');
  }),
);

app.post(
  '/user/contacts/:contact_id/objectives/create-objective',
  requiresAuthentication,
  requiresUserContactValidation,
  [
    body('periodicity')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Period is required')
      .isIn(Objective.getPeriods())
      .withMessage('Periodicity must be Weekly, Biweekly, Monthly, Quarterly'),
  ],
  catchError(async (req, res) => {
    const contactId = req.params.contact_id;
    const contact = await res.locals.store.getContact(contactId);
    contact.setObjective(new Objective(
      {
        contact_id: contactId,
        periodicity: req.body.periodicity,
        notes: req.body.notes,
      },
    ));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash('error', message.msg));
      res.locals.contact = contact;
      res.render('user/contacts/objectives/create-objective', {
        flash: req.flash(),
      });
    } else {
      const created = await res.locals.store.createObjective(contact.getObjective(), +contactId);
      if (created) req.flash('info', 'Objective was added');
      else req.flash('error', 'Something went wrong, your input passed validation, but your objective was not created');
      res.redirect(`/user/contacts/${contactId}`);
    }
  }),
);

app.get(
  '/user/contacts/:contact_id/objectives/periodic',
  requiresAuthentication,
  requiresUserContactValidation,
  catchError(async (req, res) => {
    const contactId = req.params.contact_id;
    const contact = await res.locals.store.getContact(+contactId);
    res.locals.contact = contact;
    res.render('user/contacts/objectives/periodic');
  }),
);

app.get(
  '/user/contacts/:contact_id/objectives/periodic/edit',
  requiresAuthentication,
  requiresUserContactValidation,
  catchError(async (req, res) => {
    const contactId = req.params.contact_id;
    const contact = await res.locals.store.getContact(+contactId);
    res.locals.contact = contact;
    res.render('user/contacts/objectives/edit');
  }),
);

app.post(
  '/user/contacts/:contact_id/objectives/periodic/edit',
  requiresAuthentication,
  requiresUserContactValidation,
  [
    body('periodicity')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Periodicity is required')
      .isIn(Objective.getPeriods())
      .withMessage('Periodicity must be Weekly, Biweekly, Monthly, Quarterly, or Annual'),
  ],
  catchError(async (req, res) => {
    const contactId = req.params.contact_id;
    const contact = await res.locals.store.getContact(+contactId);
    contact.getObjective().setPeriod(req.body.periodicity);
    contact.getObjective().setNotes(req.body.notes);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash('error', message.msg));
      res.locals.contact = contact;
      res.render('user/contacts/objectives/periodic/edit', {
        flash: req.flash(),
      });
    } else {
      const updated = await res.locals.store.updateObjective(contact.getObjective());
      if (updated) req.flash('info', 'Objective updated');
      else req.flash('error', 'Something went wrong, your updates passed validation, but your objective failed to update.');
      res.redirect(`/user/contacts/${contactId}/`);
    }
  }),
);

app.post(
  '/user/contacts/:contact_id/objectives/periodic/delete',
  requiresAuthentication,
  requiresUserContactValidation,
  catchError(async (req, res) => {
    const contactId = req.params.contact_id;
    const objective = await res.locals.store.getObjectiveByContactId(+contactId);
    const deleted = await res.locals.store.deleteObjective(objective.id);
    if (deleted) req.flash('info', 'Objective has been deleted');
    else req.flash('error', 'Something went wrong, objective could not be deleted');
    res.redirect(`/user/contacts/${contactId}`);
  }),
);

// Listener
app.listen(port, host, () => {
  console.log(`listening on port ${port} of ${host}!`);
});
