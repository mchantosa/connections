/// <reference types="Cypress" />

describe('Navigation', () => {
  it('Should navigate to home page', () => {
    cy.visit('/home');
    cy.get('a').contains('How it works/Tutorial').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home/how-it-works`);
  });
});
