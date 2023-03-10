/// <reference types="Cypress" />
const Objective = require('../../../../../lib/objective');

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

const path = `/user/contacts/${contactId}`;

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
  it('edit contact', () => {
    loginGoTo(user, path);
    cy.get('[data-test-id="edit"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}/edit`);
    cy.get('.active').should('not.exist');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
});

describe('create objective', () => {
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
    cy.get('[data-test-id="contact"]').click();
    cy.get('form.delete input[type="submit"]').click();
  });

  it('Haku renders correctly with no objective', () => {
    // confirm and delete contact
    cy.get('p[data-test-id="name"]').contains('Haku').click();
    cy.get('[data-test-id="objective"]').click();
    cy.get('form.delete input[type="submit"]').click();
    cy.get('p[data-test-id="name"]').contains('Haku');
    cy.get('[data-test-id="create-objective"]').click();
    cy.get('[data-test-id="page-title"]').contains('Create objective for Haku');
  });
});

describe('page info is accurate', () => {
  it('contact 1 data reflects accurately', () => {
    loginGoTo(user, path);
    cy.url().should('include', `${Cypress.config('baseUrl')}${path}`);
    cy.get('p[data-test-id="name"]').contains('Ashley');
    cy.get('p[data-test-id="preferred-medium"]').contains('none');
    cy.get('p[data-test-id="phone-number"]').contains('none');
    cy.get('p[data-test-id="email"]').contains('none');
    cy.get('p[data-test-id="address"]').contains('none');
    cy.get('p[data-test-id="objective-period"]').contains('Biweekly');
    cy.get('p[data-test-id="objective-next-contact-date"]').contains('2023-02-26');
    cy.get('p[data-test-id="objective-last-contact-date"]').contains('2023-02-15');
    cy.get('textarea[id="notes"]').should('be.empty');
  });
});

describe('delete contact', () => {
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

  it('', () => {
    // confirm and delete contact
    cy.get('p[data-test-id="name"]').contains('Haku').click();
    cy.get('form.delete input[type="submit"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts`);
    cy.get('[data-test-id="contact"]').should('have.length', 1);
  });
});
