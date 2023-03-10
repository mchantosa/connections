/// <reference types="Cypress" />

const loginGoTo = (user, path) => {
  cy.visit(path);
  cy.get('form.login dd [id="userCredential"]').type(user.username);
  cy.get('form.login dd [id="password"]').type(user.password);
  cy.get('form.login').submit();
};

const path = '/user/contacts';
const user = {
  id: 2,
  username: 'testDeveloper',
  email: 'testdeveloper@domain.com',
  password: 'developerPa22!',
};

const contacts = [
  { first_name: 'shiva', last_name: 'baby 1', periodicity: 'Weekly' },
  { first_name: 'shiva', last_name: 'baby 2', periodicity: 'Biweekly' },
  { first_name: 'shiva', last_name: 'baby 3', periodicity: 'Monthly' },
  { first_name: 'shiva', last_name: 'baby 4', periodicity: 'Quarterly' },
  { first_name: 'shiva', last_name: 'baby 5', periodicity: 'Weekly' },
  { first_name: 'shiva', last_name: 'baby 6', periodicity: 'Biweekly' },
  { first_name: 'shiva', last_name: 'baby 7', periodicity: 'Monthly' },
  { first_name: 'shiva', last_name: 'baby 8', periodicity: 'Quarterly' },
  { first_name: 'shiva', last_name: 'baby 9', periodicity: 'Weekly' },
  { first_name: 'shiva', last_name: 'baby 10', periodicity: 'Biweekly' },
  { first_name: 'shiva', last_name: 'baby 11', periodicity: 'Monthly' },
  { first_name: 'shiva', last_name: 'baby 12', periodicity: 'Quarterly' },
  { first_name: 'shiva', last_name: 'baby 13', periodicity: 'Weekly' },
  { first_name: 'shiva', last_name: 'baby 14', periodicity: 'Biweekly' },
  { first_name: 'shiva', last_name: 'baby 15', periodicity: 'Monthly' },
  { first_name: 'shiva', last_name: 'baby 16', periodicity: 'Quarterly' },
  { first_name: 'shiva', periodicity: 'Weekly' },
  { last_name: 'baby', periodicity: 'Weekly' },
];

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
  it('create contact', () => {
    loginGoTo(user, path);
    cy.get('[data-test-id="create-contact"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}/create-contact`);
    cy.get('.active').should('not.exist');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
});

describe('Page composition and function', () => {
  describe('Page with no contacts', () => {
    before(() => {
      cy.request('DELETE', `/admin/user/${user.id}/delete-all-contacts`);
    });
    it('Page with no contacts displays correctly', () => {
      loginGoTo(user, path);
      cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
      cy.get('[data-test-id="contact"]').contains('You currently have no contacts');
    });
  });

  describe('Page with > 10 contacts', () => {
    before(() => {
      cy.request('DELETE', `/admin/user/${user.id}/delete-all-contacts`);
      loginGoTo(user, path);
      contacts.forEach((contact) => {
        cy.get('[data-test-id="create-contact"]').click();
        if (contact.first_name) cy.get('[id="first_name"]').type(contact.first_name);
        if (contact.last_name) cy.get('[id="last_name"]').type(contact.last_name);
        cy.get('[id="periodicity"]').select(contact.periodicity);
        cy.get('form[data-test-id="create-contact"]').submit();
      });
    });

    after(() => {
      cy.request('DELETE', `/admin/user/${user.id}/delete-all-contacts`);
    });

    it('Page with > 10 contacts displays correctly', () => {
      cy.get('[data-test-id="contact"]').should('have.length', 10);
      cy.get('[data-test-id="name"]').first().contains('Name: baby');
      cy.get('[data-test-id="name"]').last().contains('Name: shiva baby 16');
    });

    it('Pagination works', () => {
      loginGoTo(user, path);
      cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
      cy.get('[data-test-id="page"]').should('have.length', 2);
      cy.get('span.active[data-test-id="page"]').contains('1');
      cy.get('[data-test-id="start"]').click();
      cy.url().should('equal', `${Cypress.config('baseUrl')}${path}?page=1`);
      cy.get('[data-test-id="end"]').click();
      cy.url().should('equal', `${Cypress.config('baseUrl')}${path}?page=2`);
      cy.get('span.active[data-test-id="page"]').contains('2');
    });

    it('User can select a contact', () => {
      loginGoTo(user, path);
      cy.get('[data-test-id="name"]').first().click();
      cy.get('[data-test-id="name"]').should('have.length', 1);
      cy.get('[data-test-id="name"]').contains('baby');
    });
  });
});
