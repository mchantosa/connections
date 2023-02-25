/// <reference types="Cypress" />

const loginGoTo = (user, path) => {
  cy.visit(path);
  cy.get('form.login dd [id="userCredential"]').type(user.userCred);
  cy.get('form.login dd [id="password"]').type(user.password);
  cy.get('form.login').submit();
};

describe('Create a contact', () => {
  const user = {
    id: 2,
    userName: 'testDeveloper',
    email: 'testdeveloper@domain.com',
    password: 'developerPa22!',
    userCred: 'testDeveloper',
  };
  const path = '/user/contacts/create-contact';

  beforeEach(() => {
    cy.request('DELETE', `/admin/user/${user.id}/delete-all-contacts`);
    loginGoTo(user, path);
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
    cy.get('form[data-test-id="create-contact"]').submit();

    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts`);
    cy.get('p[data-test-id="name"]').contains('Name: shiva baby');
    cy.get('p[data-test-id="preferred-medium"]').contains('Preferred Medium: chicken');
    cy.get('p[data-test-id="communication-objective"]').contains('Communication Objective: none');
    cy.get('a[data-test-id="contact"]').click();

    cy.url().should('include', `${Cypress.config('baseUrl')}/user/contacts/`);
    cy.get('p[data-test-id="name"]').contains('shiva baby');
    cy.get('p[data-test-id="preferred-medium"]').contains('chicken');
    cy.get('p[data-test-id="phone-number"]').contains('123-456-7890');
    cy.get('p[data-test-id="email"]').contains('shivababy@gmail.com');
    cy.get('p[data-test-id="address"]').contains('a pretty street a cute apt Reston, VA 98765');
    // cy.get('p[data-test-id="objective"]').contains('No periodic Objective');
    cy.get('textarea[id="notes"]').contains('tuna also works');
    cy.get('form.delete').submit();

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

    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('[id="first_name"]').type(contactObj.first_name);
    cy.get('[id="periodicity"]').select(objectiveObj.periodicity);

    cy.get('form[data-test-id="create-contact"]').submit();

    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts`);
    cy.get('p[data-test-id="name"]').contains('Name: shiva');
    cy.get('p[data-test-id="preferred-medium"]').contains('Preferred Medium: none');
    cy.get('p[data-test-id="communication-objective"]').contains('Communication Objective: none');
    cy.get('a[data-test-id="contact"]').click();

    cy.url().should('include', `${Cypress.config('baseUrl')}/user/contacts/`);
    cy.get('p[data-test-id="name"]').contains('shiva');
    cy.get('p[data-test-id="preferred-medium"]').contains('none');
    cy.get('p[data-test-id="phone-number"]').contains('none');
    cy.get('p[data-test-id="email"]').contains('none');
    cy.get('p[data-test-id="address"]').contains('none');
    // cy.get('p[data-test-id="objective"]').contains('No periodic Objective');
    cy.get('textarea[id="notes"]').should('be.empty');
    cy.get('form.delete').submit();

    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts`);
    cy.get('h3[data-test-id="contact"]').contains('You currently have no contacts');
  });
});
