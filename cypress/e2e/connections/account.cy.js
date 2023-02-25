/// <reference types="Cypress" />

const path = '/user/account';
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
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('.active').contains('Account');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
  it('header, nav, logout', () => {
    loginGoTo(user, path);
    cy.get('.fifth form').submit();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home`);
    cy.get('.active').contains('Home');
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
  it('update-username', () => {
    loginGoTo(user, path);
    cy.get('[data-test-id="update-username"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}/update-username`);
    cy.get('.active').should('not.exist');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
  it('update-email', () => {
    loginGoTo(user, path);
    cy.get('[data-test-id="update-email"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}/update-email`);
    cy.get('.active').should('not.exist');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
  it('reset-password', () => {
    loginGoTo(user, path);
    cy.get('[data-test-id="reset-password"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}/reset-password`);
    cy.get('.active').should('not.exist');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
  it('update-account-information', () => {
    loginGoTo(user, path);
    cy.get('[data-test-id="update-account-information"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}/update-account-information`);
    cy.get('.active').should('not.exist');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
});

describe('account page content', () => {
  it('page content with no name out of box developer', () => {
    loginGoTo(user, path);
    cy.get('[data-test-id="username"]').contains(user.username);
    cy.get('[data-test-id="email"]').contains(user.email);
    cy.get('[data-test-id="first-name"]').contains('None');
    cy.get('[data-test-id="last-name"]').contains('None');
  });
});
