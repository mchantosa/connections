/// <reference types="Cypress" />
const Objective = require('../../../../../../lib/objective');

const path = '/user/contacts/1/objectives/periodic/1/edit';
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
  it('contact', () => {
    loginGoTo(user, path);
    cy.get('[data-test-id="contact"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts/1`);
    cy.get('.active').should('not.exist');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
});

describe('Edit an objective', () => {
  const objective = {
    periodicity: 'Biweekly',
  };
  const updatedObjectiveObj = {
    periodicity: 'Weekly',
    notes: 'Ask Ashley if she wants to go to the fish park',
  };

  after(() => {
    // restore testData to original configuration
    cy.visit(path);
    cy.get('[id="periodicity"]').select(objective.periodicity);
    cy.get('textarea').clear();
    cy.get('form[data-test-id="save-objective"] input[type="submit"]').click();
  });

  it('edit contact fields', () => {
    // define
    loginGoTo(user, path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('[id="periodicity"]').select(updatedObjectiveObj.periodicity);
    cy.get('textarea').clear().type(updatedObjectiveObj.notes);
    cy.get('form[data-test-id="save-objective"] input[type="submit"]').click();

    // check details
    cy.url().should('include', `${Cypress.config('baseUrl')}/user/contacts/1`);
    cy.get('li.message.info').should('contain', 'Objective updated');
    cy.get('p[data-test-id="objective-period"]').contains(updatedObjectiveObj.periodicity);
    cy.get('p[data-test-id="objective-next-contact-date"]').contains(Objective.getLastSunday());
    cy.get('p[data-test-id="objective-last-contact-date"]').contains('2023-02-15');
    cy.get('[data-test-id="objective"]').click();
    cy.get('[data-test-id="periodicity"]').contains(updatedObjectiveObj.periodicity);
    cy.get('[data-test-id="next-contact-date"]').contains(Objective.getLastSunday());
    cy.get('[data-test-id="last-contact-date"]').contains('2023-02-15');
    cy.get('textarea').contains(updatedObjectiveObj.notes);
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
    // create an objective to delete
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
    // cy.get('li.message.info').contains('Haku has been deleted');
    cy.get('[data-test-id="create-objective"]').should('exist');
  });
});
