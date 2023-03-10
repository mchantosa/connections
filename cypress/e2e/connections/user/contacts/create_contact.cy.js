/// <reference types="Cypress" />
const Objective = require('../../../../../lib/objective');

const loginGoTo = (user, path) => {
  cy.visit(path);
  cy.get('form.login dd [id="userCredential"]').type(user.username);
  cy.get('form.login dd [id="password"]').type(user.password);
  cy.get('form.login').submit();
};

const user = {
  id: 2,
  username: 'testDeveloper',
  email: 'testdeveloper@domain.com',
  password: 'developerPa22!',
};
const path = '/user/contacts/create-contact';

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
});

describe('Create a contact', () => {
  beforeEach(() => {
    cy.request('DELETE', `/admin/user/${user.id}/delete-all-contacts`);
    loginGoTo(user, path);
  });

  it('Create a contact with bad input', () => {
    const contactObj = {
      first_name: 'shiva',
    };
    const objectiveObj = {
      periodicity: 'Biweekly',
    };

    // bad period
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('[id="first_name"]').type(contactObj.first_name);
    cy.get('form[data-test-id="create-contact"] input[type="submit"]').click();

    // check messaging and page formation
    cy.get('li.message.error').should('contain', 'Period is required')
      .and('contain', 'Periodicity must be Weekly, Biweekly, Monthly, Quarterly');
    cy.get('[id="first_name"]').should('have.value', contactObj.first_name);

    // no name
    cy.get('[id="first_name"]').clear();
    cy.get('[id="periodicity"]').select(objectiveObj.periodicity);
    cy.get('form[data-test-id="create-contact"] input[type="submit"]').click();

    // check messaging and page formation
    cy.get('li.message.error').should('contain', 'A contact name is required, please enter either a first or last name');
    cy.get('[id="periodicity"]').should('have.value', objectiveObj.periodicity);
  });

  it('Create a maximal contact', () => {
    const contactObj = {
      first_name: 'shiva',
      last_name: 'baby',
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
    const objectiveObj = {
      periodicity: 'Biweekly',
    };

    // define
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('[id="first_name"]').type(contactObj.first_name);
    cy.get('[id="last_name"]').type(contactObj.last_name);
    cy.get('[id="preferred_medium"]').type(contactObj.preferred_medium);
    cy.get('[id="phone_number"]').type(contactObj.phone_number);
    cy.get('[id="email"]').type(contactObj.email);
    cy.get('[id="street_address_1"]').type(contactObj.street_address_1);
    cy.get('[id="street_address_2"]').type(contactObj.street_address_2);
    cy.get('[id="city"]').type(contactObj.city);
    cy.get('[id="state_code"]').select(contactObj.state_code);
    cy.get('[id="zip_code"]').type(contactObj.zip_code);
    cy.get('[id="country"]').type(contactObj.country);
    cy.get('[id="notes"]').type(contactObj.notes);
    cy.get('[id="periodicity"]').select(objectiveObj.periodicity);
    cy.get('form[data-test-id="create-contact"] input[type="submit"]').click();

    // check contacts
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts`);
    cy.get('li.message.info').should('contain', 'shiva baby was created')
      .and('contain', 'objective for shiva baby was created');
    cy.get('p[data-test-id="name"]').contains('Name: shiva baby');
    cy.get('p[data-test-id="preferred-medium"]').contains('Preferred Medium: chicken');
    cy.get('p[data-test-id="communication-objective"]').contains('Communication Objective: Biweekly');
    cy.get('a[data-test-id="contact"]').click();

    // check details
    cy.url().should('include', `${Cypress.config('baseUrl')}/user/contacts/`);
    cy.get('p[data-test-id="name"]').contains('shiva baby');
    cy.get('p[data-test-id="preferred-medium"]').contains('chicken');
    cy.get('p[data-test-id="phone-number"]').contains('123-456-7890');
    cy.get('p[data-test-id="email"]').contains('shivababy@gmail.com');
    cy.get('p[data-test-id="address"]').contains('a pretty street a cute apt Reston, VA 98765');
    cy.get('p[data-test-id="objective-period"]').contains('Biweekly');
    cy.get('p[data-test-id="objective-next-contact-date"]').contains(Objective.getNextSunday());
    cy.get('p[data-test-id="objective-last-contact-date"]').contains('No record');
    cy.get('textarea[id="notes"]').contains('tuna also works');

    // delete
    cy.get('form.delete input[type="submit"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts`);
    cy.get('h3[data-test-id="contact"]').contains('You currently have no contacts');
  });

  it('Create a minimal contact', () => {
    const contactObj = {
      first_name: 'shiva',
    };
    const objectiveObj = {
      periodicity: 'Weekly',
    };

    // define
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('[id="first_name"]').type(contactObj.first_name);
    cy.get('[id="periodicity"]').select(objectiveObj.periodicity);
    cy.get('form[data-test-id="create-contact"] input[type="submit"]').click();

    // check contacts
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts`);
    cy.get('li.message.info').should('contain', 'shiva was created')
      .and('contain', 'objective for shiva was created');
    cy.get('p[data-test-id="name"]').contains('Name: shiva');
    cy.get('p[data-test-id="preferred-medium"]').contains('Preferred Medium: none');
    cy.get('p[data-test-id="communication-objective"]').contains('Communication Objective: Weekly');
    cy.get('a[data-test-id="contact"]').click();

    // check details
    cy.url().should('include', `${Cypress.config('baseUrl')}/user/contacts/`);
    cy.get('p[data-test-id="name"]').contains('shiva');
    cy.get('p[data-test-id="preferred-medium"]').contains('none');
    cy.get('p[data-test-id="phone-number"]').contains('none');
    cy.get('p[data-test-id="email"]').contains('none');
    cy.get('p[data-test-id="address"]').contains('none');
    cy.get('p[data-test-id="objective-period"]').contains('Weekly');
    cy.get('p[data-test-id="objective-next-contact-date"]').contains(Objective.getNextSunday());
    cy.get('p[data-test-id="objective-last-contact-date"]').contains('No record');
    cy.get('textarea[id="notes"]').should('be.empty');

    // delete
    cy.get('form.delete input[type="submit"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts`);
    cy.get('h3[data-test-id="contact"]').contains('You currently have no contacts');
  });
});
