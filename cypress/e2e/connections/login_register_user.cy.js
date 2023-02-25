/// <reference types="Cypress" />

const path = '/login';
const user = {
  username: 'testUser',
  email: 'testUser@domain.com',
  password: '12qw!@QW',
};

describe('login page navigation', () => {
  it('header, nav, home', () => {
    cy.visit(path);
    cy.get('.first a').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home`);
  });
  it('header, nav, login', () => {
    cy.visit(path);
    cy.get('.fifth a').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
  it('footer, privacy', () => {
    cy.visit(path);
    cy.get('[data-test-id="privacy"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home/privacy`);
  });
});

describe('register an account', () => {
  after(() => {
    cy.request('DELETE', `/admin/user/${user.username}/delete`);
  });

  it('register a user', () => {
    cy.visit(path);
    cy.get('.active').contains('Login');
    cy.get('form.register dd [id="username"]').type('testAdmin');
    cy.get('form.register dd [id="email"]').type('testadmin@domain.com');
    cy.get('form.register dd [id="password"]').type('12qw!@qw');
    cy.get('form.register dd [id="confirm-password"]').type('12qw!@qw');
    cy.get('form.register').submit();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/register`);
    cy.get('.active').contains('Login');
    cy.get('li.message.error').contains('This username is already associated with an account');

    cy.get('form.register dd [id="username"]').clear().type('1234567');
    cy.get('form.register').submit();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/register`);
    cy.get('.active').contains('Login');
    cy.get('li.message.error').contains('This email is already associated with an account');

    cy.get('form.register dd [id="email"]').clear().type('noAt');
    cy.get('form.register').submit();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/register`);
    cy.get('.active').contains('Login');
    cy.get('li.message.error')
      .should('contain', 'Username must have a minimum of 8 characters')
      .and('contain', 'Invalid Email')
      .and('contain', 'Passwords must have a minimum of 8 characters')
      .and('contain', 'Password requires a number')
      .and('contain', 'Password requires a lowercase and upper case letter')
      .and('contain', 'Password requires a special character: *.!@$%^&(){}[]~');

    cy.get('form.register dd [id="username"]').clear().type(user.username);
    cy.get('form.register dd [id="email"]').clear().type(user.email);
    cy.get('form.register dd [id="password"]').type(user.password);
    cy.get('form.register dd [id="confirm-password"]').type('12qw!@qw');
    cy.get('form.register').submit();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/register`);
    cy.get('.active').contains('Login');
    cy.get('li.message.error').contains('Your password and confirmation password do not match');

    cy.get('form.register dd [id="password"]').type(user.password);
    cy.get('form.register dd [id="confirm-password"]').type(user.password);
    cy.get('form.register').submit();
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('.active').contains('Login');
    cy.get('li.message.info').contains('Your account has been created, please login');
  });

  it('login a user first time', () => {
    cy.visit(path);
    cy.get('.active').contains('Login');
    cy.get('form.login dd [id="userCredential"]').type('testUse');
    cy.get('form.login dd [id="password"]').type(user.password);
    cy.get('form.login').submit();

    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('.active').contains('Login');
    cy.get('li.message.error').contains('That username or email is not recognized, please try again.');
    cy.get('form.login dd [id="userCredential"]').clear().type('testUser');
    cy.get('form.login dd [id="password"]').type('12qw!@qw');
    cy.get('form.login').submit();

    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('.active').contains('Login');
    cy.get('li.message.error').contains('Your credentials were invalid, please try again.');
    cy.get('form.login dd [id="password"]').type(user.password);
    cy.get('form.login').submit();

    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/home`);
    cy.get('.active').contains('Home');
    cy.get('h3').contains("It looks like you don't have any contacts. To populate this page, please create a contact.");
  });
});
