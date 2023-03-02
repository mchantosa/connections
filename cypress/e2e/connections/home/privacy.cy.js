/// <reference types="Cypress" />
const path = 'home/privacy';

describe('Navigation', () => {
  it('header, nav, home', () => {
    cy.visit(path);
    cy.get('.first a').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home`);
    cy.get('.active').contains('Connections');
  });

  it('header, nav, login', () => {
    cy.visit(path);
    cy.get('.fifth a').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/login`);
    cy.get('.active').contains('Login');
  });

  it('footer, privacy', () => {
    cy.visit(path);
    cy.get('[data-test-id="privacy"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home/privacy`);
    cy.get('.active').should('not.exist');
  });

  it('header, nav, home', () => {
    cy.visit(path);
    cy.get('[data-test-id="greetings-link"]').click();
    cy.url().should('equal', `${Cypress.config('baseUrl')}/home`);
    cy.get('.active').contains('Connections');
  });

  // it('header, nav, home', () => {
  // cy.visit(path);
  // cy.get('[data-test-id="contact-us"]').click();
  // cy.url().should('equal', `${Cypress.config('baseUrl')}/home`);
  // cy.get('.active').contains('Connections');
  // });
});
