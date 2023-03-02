/// <reference types="Cypress" />
const Objective = require('../../../../../lib/objective');

const path = '/user/contacts/1/edit';
const user = {
  id: 1,
  username: 'testAdmin',
  email: 'testadmin@domain.com',
  password: 'adminPa22!',
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
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts/1`);
    cy.get('.active').should('not.exist');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
});

describe('Edit a contact', () => {
  const contactObj = {
    first_name: 'Ashley',
  };
  const updatedContactObj = {
    first_name: 'Bad',
    last_name: 'Dog',
    preferred_medium: 'chicken',
    phone_number: '123-456-7890',
    email: 'shivababy@gmail.com',
    street_address_1: 'a pretty street',
    street_address_2: 'a cute apt',
    city: 'Reston',
    state_code: 'VA',
    zip_code: '98765',
    country: 'United States',
    // last_connection: '1000-01-01',
    notes: 'tuna also works',
  };

  after(() => {
    // restore testData to original configuration
    cy.visit(path);
    cy.get('[id="first_name"]').clear().type(contactObj.first_name);
    cy.get('[id="last_name"]').clear();
    cy.get('[id="preferred_medium"]').clear();
    cy.get('[id="phone_number"]').clear();
    cy.get('[id="email"]').clear();
    cy.get('[id="street_address_1"]');
    cy.get('[id="street_address_2"]');
    cy.get('[id="city"]').clear();
    cy.get('[id="state_code"]').select('');
    cy.get('[id="zip_code"]').clear();
    cy.get('[id="country"]').clear();
    cy.get('[id="notes"]').clear();
    cy.get('form[data-test-id="save-contact"] input[type="submit"]').click();
  });

  it('edit contact fields', () => {
    // define
    loginGoTo(user, path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('[id="first_name"]').clear().type(updatedContactObj.first_name);
    cy.get('[id="last_name"]').clear().type(updatedContactObj.last_name);
    cy.get('[id="preferred_medium"]').clear().type(updatedContactObj.preferred_medium);
    cy.get('[id="phone_number"]').clear().type(updatedContactObj.phone_number);
    cy.get('[id="email"]').clear().type(updatedContactObj.email);
    cy.get('[id="street_address_1"]').clear().type(updatedContactObj.street_address_1);
    cy.get('[id="street_address_2"]').clear().type(updatedContactObj.street_address_2);
    cy.get('[id="city"]').clear().type(updatedContactObj.city);
    cy.get('[id="state_code"]').select(updatedContactObj.state_code);
    cy.get('[id="zip_code"]').clear().type(updatedContactObj.zip_code);
    cy.get('[id="country"]').clear().type(updatedContactObj.country);
    cy.get('[id="notes"]').clear().type(updatedContactObj.notes);
    cy.get('form[data-test-id="save-contact"] input[type="submit"]').click();

    // check details
    cy.url().should('include', `${Cypress.config('baseUrl')}/user/contacts/1`);
    cy.get('li.message.info').should('contain', 'Dog, Bad changes were saved');
    cy.get('p[data-test-id="name"]').contains('Dog, Bad');
    cy.get('p[data-test-id="preferred-medium"]').contains('chicken');
    cy.get('p[data-test-id="phone-number"]').contains('123-456-7890');
    cy.get('p[data-test-id="email"]').contains('shivababy@gmail.com');
    cy.get('p[data-test-id="address"]').contains('a pretty street a cute apt Reston, VA 98765');
    cy.get('p[data-test-id="objective-period"]').contains('Biweekly');
    cy.get('p[data-test-id="objective-next-contact-date"]').contains(Objective.getLastSunday());
    cy.get('p[data-test-id="objective-last-contact-date"]').contains('2023-02-15');
    cy.get('textarea[id="notes"]').contains('tuna also works');
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
    cy.get('li.message.info').contains('Haku has been deleted');
    cy.get('[data-test-id="contact"]').should('have.length', 1);
  });
});
