/// <reference types="Cypress" />

describe('Navigation', () => {
  it('header, nav, home', () => {
    cy.visit('/home');
    cy.get('.first a').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home`);
    cy.get('.active').contains('Connections');
  });

  it('header, nav, login', () => {
    cy.visit('/home');
    cy.get('.fifth a').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/login`);
    cy.get('.active').contains('Login');
  });

  it('footer, privacy', () => {
    cy.visit('/home');
    cy.get('[data-test-id="privacy"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home/privacy`);
    cy.get('.active').should('not.exist');
  });

  it('Should navigate to how-it-works ', () => {
    cy.visit('/home');
    cy.get('a').contains('How it works/Tutorial').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home/how-it-works`);
    cy.get('.active').should('not.exist');
  });
});
