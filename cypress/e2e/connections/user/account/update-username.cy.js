/// <reference types="Cypress" />

const loginGoTo = (user, path) => {
  cy.visit(path);
  cy.get('form.login dd [id="userCredential"]').type(user.username);
  cy.get('form.login dd [id="password"]').type(user.password);
  cy.get('form.login').submit();
};

const path = '/user/account/update-username';
const user = {
  id: 2,
  username: 'testDeveloper',
  email: 'testdeveloper@domain.com',
  password: 'developerPa22!',
};

describe('account page navigation', () => {
  it('header, nav, home', () => {
    loginGoTo(user, path);
    cy.get('.first a').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home`);
    cy.get('.active').contains('Connections');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
  it('header, nav, user/home', () => {
    loginGoTo(user, path);
    cy.get('.second a').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/home`);
    cy.get('.active').contains('Home');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
  it('header, nav, contacts', () => {
    loginGoTo(user, path);
    cy.get('.third a').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts`);
    cy.get('.active').contains('Contacts');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
  it('header, nav, account', () => {
    loginGoTo(user, path);
    cy.get('.fourth a').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/account`);
    cy.get('.active').contains('Account');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
  it('header, nav, logout', () => {
    loginGoTo(user, path);
    cy.get('.fifth form').submit();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home`);
    cy.get('.active').contains('Connections');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}/login?redirect=${path}`);
  });
  it('footer, privacy', () => {
    loginGoTo(user, path);
    cy.get('[data-test-id="privacy"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home/privacy`);
    cy.get('.active').should('not.exist');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
  it('cancel', () => {
    loginGoTo(user, path);
    cy.get('[data-test-id="cancel"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/account`);
    cy.get('.active').contains('Account');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
});

describe('Password reset, given knowledge of existing password:', () => {
  const updatedUser = {
    id: 2,
    username: 'testDeveloperBoom',
    // email: 'testdeveloper@gmail.com',
    // password: '12qw!@QW',
    // first_name: 'shiva',
    // last_name: 'the developer',
  };

  after(() => {
    // restore testDeveloper original configuration
    cy.visit(path);
    cy.get('[id="username"]').clear().type(user.username);
    cy.get('[data-test-id="update"]').submit();
  });

  it('login, update username short username, submit form', () => {
    loginGoTo(user, path);
    cy.get('[id="username"]').clear().type('dev');
    cy.get('[data-test-id="update"]').submit();

    // confirm successful redirect and messaging
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('li.message.error').contains('Username must have a minimum of 8 characters');
    cy.get('[id="username"]').should('have.value', 'dev');
  });

  it('login, update username with @, submit form', () => {
    loginGoTo(user, path);
    cy.get('[id="username"]').clear().type('testdeveloper@domain.com');
    cy.get('[data-test-id="update"]').submit();

    // confirm successful redirect and messaging
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('li.message.error').contains('Username cannot contain an @ symbol');
    cy.get('[id="username"]').should('have.value', 'testdeveloper@domain.com');
  });

  it('login, update with same username, submit form', () => {
    loginGoTo(user, path);
    cy.get('[id="username"]').clear().type(user.username);
    cy.get('[data-test-id="update"]').submit();

    // confirm successful redirect and messaging
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/account`);
    cy.get('li.message.info').contains('Your updated username matched your existing username, your username was not updated');
    cy.get('[data-test-id="username"]').contains(user.username);
  });

  it('login, update with in use username, submit form', () => {
    loginGoTo(user, path);
    cy.get('[id="username"]').clear().type('testAdmin');
    cy.get('[data-test-id="update"]').submit();

    // confirm successful redirect and messaging
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('li.message.error').contains('This username unavailable');
    cy.get('[id="username"]').should('have.value', 'testAdmin');
  });

  it('login, update fields, submit form', () => {
    loginGoTo(user, path);
    cy.get('[id="username"]').clear().type(updatedUser.username);
    cy.get('[data-test-id="update"]').submit();

    // confirm successful redirect and messaging
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/account`);
    cy.get('li.message.info').contains('Your username has been updated');
    cy.get('[data-test-id="username"]').contains(updatedUser.username);

    // logout, confirm you can login with new password
    cy.get('.fifth form').submit();
    loginGoTo({
      username: updatedUser.username,
      password: user.password,
    }, '/user/account');
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/account`);
    cy.get('[data-test-id="username"]').contains(updatedUser.username);
  });
});
