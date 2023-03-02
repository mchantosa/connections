/// <reference types="Cypress" />
const moment = require('moment');
const Objective = require('../../../../lib/objective');

const path = '/user/home';
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
});

describe('landing page with no contacts has a create contact button', () => {
  before(() => {
    cy.request('DELETE', `/admin/user/${user.id}/delete-all-contacts`);
    loginGoTo(user, path);
  });
  it('Landing page with no contacts exposes a "Create Contact" link', () => {
    cy.get('[data-test-id="create-contact"]').should('exist');
    cy.get('[data-test-id="create-contact"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts/create-contact`);
  });
});

describe('landing page with no current contacts has gives details an instruction page', () => {
  before(() => {
    cy.request('DELETE', `/admin/user/${user.id}/delete-all-contacts`);
    loginGoTo(user, path);
    cy.get('[data-test-id="create-contact"]').click();
    const contact = contacts[0];
    if (contact.first_name) cy.get('[id="first_name"]').type(contact.first_name);
    if (contact.last_name) cy.get('[id="last_name"]').type(contact.last_name);
    cy.get('[id="periodicity"]').select(contact.periodicity);
    cy.get('form[data-test-id="create-contact"]').submit();
    cy.visit(path);
  });
  it('Landing page with no current contacts exposes instructions', () => {
    cy.get('[data-test-id="create-contact"]').should('not.exist');
    cy.get('[data-test-id="current-objective"]').should('not.exist');
    cy.get('[data-test-id="future-objective"]').should('have.length', 1);
    cy.get('[data-test-id="instructions"]').children().should('contain', 'You currently have no objectives for this week')
      .and('contain', 'Pull: Selecting pull will pull an objective into this period')
      .and('contain', 'Snooze: Selecting snooze will add a week to your objective next contact date')
      .and('contain', 'Complete: Selecting complete will mark your last date of contact and queue your objective for a period out')
      .and('contain', '"Coming up" looks out two weeks');
  });
});

describe('move connections', () => {
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
    cy.visit(path);
  });
  after(() => {
    cy.request('DELETE', `/admin/user/${user.id}/delete-all-contacts`);
  });
  describe('Pull', () => {
    it('all connections are future with a next contact date of next sunday', () => {
      cy.get('[data-test-id="current-objective"]').should('not.exist');
      const futureObjectives = cy.get('[data-test-id="future-objective"]');
      futureObjectives.should('have.length', 18);
      futureObjectives.each((el) => {
        cy.wrap(el)
          .find('[data-test-id="next-contact-date"]')
          .should('have.text', `Next Contact Date:\u00a0\u00a0${Objective.getNextSunday()}`);
      });
    });
    it('pull first 5 alphabetical elements', () => {
      loginGoTo(user, path);
      // pull first 5 connections
      for (let index = 0; index < 5; index += 1) {
        cy.get('[data-test-id="future-objective"]')
          .first()
          .children()
          .find('button.pull')
          .click();
        cy.reload();
      }
      // confirm first 5 are current connections in the proper order with a modified date
      cy.get('[data-test-id="current-objective"]').should('have.length', 5);
      const names = [
        'Name:\u00a0\u00a0baby',
        'Name:\u00a0\u00a0baby 10, shiva',
        'Name:\u00a0\u00a0baby 11, shiva',
        'Name:\u00a0\u00a0baby 12, shiva',
        'Name:\u00a0\u00a0baby 13, shiva',
      ];
      cy.get('[data-test-id="current-objective"]').each((el, index) => {
        const children = cy.wrap(el).children();
        // order by name
        children
          .first()
          .should('have.text', names[index]);
        // modified date
        children
          .first()
          .next()
          .next()
          .should('have.text', `Next Contact Date:\u00a0\u00a0${Objective.getLastSunday()}`);
      });
      // pulled objectives aren't in future objectives
      cy.get('[data-test-id="future-objective"]').should('have.length', 13);
      cy.get('[data-test-id="future-objective"]').each((el) => {
        cy.wrap(el).children().first().should('not.have.text', names[0])
          .and('not.have.text', names[1])
          .and('not.have.text', names[2])
          .and('not.have.text', names[3])
          .and('not.have.text', names[4]);
      });
    });
  });
  describe('Snooze', () => {
    it('Snoozing adds a week to next contact date and pushes connection to future connections', () => {
      loginGoTo(user, path);
      cy.get('[data-test-id="current-objective"]').first().find('button.snooze').click();

      const baby = cy.get('[data-test-id="future-objective"]').first().children();
      // first alphabetically
      baby
        .first()
        .should('have.text', 'Name:\u00a0\u00a0baby');
      // modified date
      baby
        .first()
        .next()
        .next()
        .should('have.text', `Next Contact Date:\u00a0\u00a0${Objective.getNextSunday()}`);
    });
    it('Connections are sorted by next contact date over name', () => {
      loginGoTo(user, path);
      cy.get('[data-test-id="future-objective"]').first().find('button.snooze').click();

      const nextSunday = Objective.getNextSunday();
      const babySnoozeDate = moment(nextSunday).utc()
        .add(7, 'days')
        .format('YYYY-MM-DD');
      const baby = cy.get('[data-test-id="future-objective"]').last().children();
      // last by next contact date
      baby
        .first()
        .should('have.text', 'Name:\u00a0\u00a0baby');
      // modified date
      baby
        .first()
        .next()
        .next()
        .should('have.text', `Next Contact Date:\u00a0\u00a0${babySnoozeDate}`);
    });
  });
  describe('Complete', () => {
    it('Complete adds a period to next contact date and sets last contact date', () => {
      loginGoTo(user, path);
      cy.get('[data-test-id="current-objective"]').should('have.length', 4);
      cy.get('[data-test-id="future-objective"]').should('have.length', 14);
      cy.get('[data-test-id="current-objective"]').last().find('button.completed').click();
      cy.reload();
      cy.get('[data-test-id="current-objective"]').last().find('button.completed').click();
      cy.reload();
      cy.get('[data-test-id="current-objective"]').should('have.length', 2);
      cy.get('[data-test-id="future-objective"]').should('have.length', 15);
    });
    it('Complete sets last contact date', () => {
      loginGoTo(user, path);
      cy.get('[data-test-id="future-objective"]')
        .first()
        .find('[data-test-id="last-contact-date"]')
        .should('have.text', `Last Contact Date:\u00a0\u00a0${Objective.getMomentDate()}`);
    });
    it('Sorts by next contact over last contact over name', () => {
      loginGoTo(user, path);
      cy.get('[data-test-id="future-objective"]').each((el, index) => {
        if (index === 13) {
          cy.wrap(el).find('button.pull').click();
          cy.reload();
        }
      });
      cy.get('[data-test-id="current-objective"]')
        .last()
        .find('button.completed')
        .click();
      cy.get('[data-test-id="future-objective"]').each((el, index) => {
        if (index === 0) {
          cy.wrap(el).children().first().should('have.text', 'Name:\u00a0\u00a0baby 13, shiva');
        } else if (index === 1) {
          cy.wrap(el).children().first().should('have.text', 'Name:\u00a0\u00a0shiva');
        } else if (index === 2) {
          cy.wrap(el).children().first().should('have.text', 'Name:\u00a0\u00a0baby 14, shiva');
        }
      });
    });
  });
});
