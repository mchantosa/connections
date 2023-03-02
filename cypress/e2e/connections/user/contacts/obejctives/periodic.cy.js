/// <reference types="Cypress" />
const Objective = require('../../../../../../lib/objective');

const loginGoTo = (user, path) => {
  cy.visit(path);
  cy.get('form.login dd [id="userCredential"]').type(user.username);
  cy.get('form.login dd [id="password"]').type(user.password);
  cy.get('form.login').submit();
};
const user = {
  id: 1,
  username: 'testAdmin',
  email: 'testadmin@domain.com',
  password: 'adminPa22!',
};
const contactId = 1;

const path = `/user/contacts/${contactId}/objectives/periodic/1`;

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
  it('edit objective', () => {
    loginGoTo(user, path);
    cy.get('[data-test-id="edit"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}/edit`);
    cy.get('.active').should('not.exist');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
  it('go to contact', () => {
    loginGoTo(user, path);
    cy.get('[data-test-id="contact"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts/1`);
    cy.get('.active').should('not.exist');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
});

describe('page info is accurate', () => {
  it('objective 1 data reflects accurately', () => {
    loginGoTo(user, path);
    cy.url().should('include', `${Cypress.config('baseUrl')}${path}`);
    cy.get('[data-test-id="periodicity"]').contains('Biweekly');
    cy.get('[data-test-id="next-contact-date"]').contains(Objective.getLastSunday());
    cy.get('[data-test-id="last-contact-date"]').contains('2023-02-15');
    cy.get('textarea').should('be.empty');
    cy.get('textarea').should('be.disabled');
  });
});

describe('delete objective', () => {
  const contactObj = {
    first_name: 'Haku',
  };
  const objectiveObj = {
    periodicity: 'Weekly',
  };
  before(() => {
    // create a contact to delete
    loginGoTo(user, '/user/contacts/create-contact');
    cy.get('[id="first_name"]').type(contactObj.first_name);
    cy.get('[id="periodicity"]').select(objectiveObj.periodicity);
    cy.get('form[data-test-id="create-contact"] input[type="submit"]').click();
  });

  after(() => {
    cy.get('form.delete input[type="submit"]').click();
  });

  it('', () => {
    // confirm and delete contact
    cy.get('p[data-test-id="name"]').contains('Haku').click();
    cy.get('[data-test-id="objective"]').click();
    cy.get('form.delete input[type="submit"]').click();
    cy.get('p[data-test-id="name"]').contains('Haku');
    cy.get('[data-test-id="create-objective"]').should('exist');
  });
});
