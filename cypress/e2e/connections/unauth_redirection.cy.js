/// <reference types="Cypress" />

describe('Unauth redirects to login', () => {
  it('/user/contacts redirects to /login', () => {
    cy.visit('/user/contacts');
    // cy.get('.error').should('include', 'You must be logged in to access that content');
    cy.url().should('include', '/login');
  });
  it('/user/home redirects to /login', () => {
    cy.visit('/user/home');
    // cy.get('.error').should('include', 'You must be logged in to access that content');
    cy.url().should('include', '/login');
  });
});
