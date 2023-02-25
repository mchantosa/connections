/// <reference types="Cypress" />

// const { response } = require('express');

const loginGoTo = (user, path) => {
  cy.visit(path);
  cy.get('form.login dd [id="userCredential"]').type(user.userCred);
  cy.get('form.login dd [id="password"]').type(user.password);
  cy.get('form.login').submit();
};

describe('Edit a contact', () => {
  const user = {
    id: 2,
    userName: 'testDeveloper',
    email: 'testdeveloper@domain.com',
    password: 'developerPa22!',
    userCred: 'testDeveloper',
  };

  let path;

  before(() => {
    cy.request('DELETE', `/admin/user/${user.id}/delete-all-contacts`);
    cy.request({
      method: 'POST',
      url: `/admin/user/${user.id}/contacts/create-contact`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        first_name: 'shiva',
        last_name: 'baby',
      },
    }).then((response) => {
      path = `/user/contacts/${response.body.id}/edit`;
      loginGoTo(user, path);
    });
  });

  it('edit contact fields', () => {
    const contactObj = {
      first_name: 'shiva',
    };

    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    // cy.get('[id="first_name"]').type(contactObj.first_name);
    // cy.get('form[data-test-id="create-contact"]').submit();

    // cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts`);
    // cy.get('p[data-test-id="name"]').contains('Name: shiva');
    // cy.get('p[data-test-id="preferred-medium"]').contains('Preferred Medium: none');
    // cy.get('p[data-test-id="communication-objective"]').contains('Communication Objective: none');
    // cy.get('a[data-test-id="contact"]').click();

    // cy.url().should('include', `${Cypress.config('baseUrl')}/user/contacts/`);
    // cy.get('p[data-test-id="name"]').contains('shiva');
    // cy.get('p[data-test-id="preferred-medium"]').contains('none');
    // cy.get('p[data-test-id="phone-number"]').contains('none');
    // cy.get('p[data-test-id="email"]').contains('none');
    // cy.get('p[data-test-id="address"]').contains('none');
    // cy.get('p[data-test-id="objective"]').contains('No periodic Objective');
    // cy.get('textarea[id="notes"]').should('be.empty');
    // cy.get('form.delete').submit();

    // cy.url().should('equal', `${Cypress.config('baseUrl')}/user/contacts`);
    // cy.get('h3[data-test-id="contact"]').contains('You currently have no contacts');
  });
});
