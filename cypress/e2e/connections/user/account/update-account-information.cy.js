/// <reference types="Cypress" />

const path = '/user/account/update-account-information';
const user = {
  id: 2,
  username: 'testDeveloper',
  email: 'testdeveloper@domain.com',
  password: 'developerPa22!',
};

const loginGoTo = (user, path) => {
  cy.visit(path);
  cy.get('form.login dd [id="userCredential"]').type(user.username);
  cy.get('form.login dd [id="password"]').type(user.password);
  cy.get('form.login').submit();
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
    // username: 'testDeveloper!',
    // email: 'testdeveloper@gmail.com',
    // password: '12qw!@QW',
    first_name: 'shiva',
    last_name: 'the developer',
  };

  after(() => {
    // restore testDeveloper original configuration
    cy.visit(path);
    cy.get('[id="first-name"]').clear().type(' ');
    cy.get('[id="last-name"]').clear().type(' ');
    cy.get('[data-test-id="update"]').submit();
  });

  it('login, update fields, submit form', () => {
    loginGoTo(user, path);
    // Cypress.log('asdf');
    cy.get('[id="first-name"]').clear().type(updatedUser.first_name);
    cy.get('[id="last-name"]').clear().type(updatedUser.last_name);
    cy.get('[data-test-id="update"]').submit();

    // confirm successful redirect and messaging
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/account`);
    cy.get('li.message.info').contains('Your account information has been updated');
    cy.get('[data-test-id="first-name"]').contains(updatedUser.first_name);
    cy.get('[data-test-id="last-name"]').contains(updatedUser.last_name);
  });
});
