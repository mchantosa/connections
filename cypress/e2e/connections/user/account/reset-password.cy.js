/// <reference types="Cypress" />

const loginGoTo = (user, path) => {
  cy.visit(path);
  cy.get('form.login dd [id="userCredential"]').type(user.username);
  cy.get('form.login dd [id="password"]').type(user.password);
  cy.get('form.login').submit();
};

const path = '/user/account/reset-password';
const user = {
  id: 2,
  username: 'testDeveloper',
  email: 'testdeveloper@domain.com',
  password: 'developerPa22!',
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
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/account`);
    cy.get('.active').contains('Account');
    cy.visit(path);
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
  });
});

describe('Password reset, given knowledge of existing password:', () => {
  const updatedUser = {
    id: 2,
    // username: 'testDeveloper!',
    // email: 'testdeveloper@gmail.com',
    password: '12qw!@QW',
    // first_name: 'shiva',
    // last_name: 'the developer',
  };

  after(() => {
    // restore testDeveloper original configuration
    cy.visit(path);
    cy.get('#password').type(updatedUser.password);
    cy.get('#new-password').type(user.password);
    cy.get('#confirm-password').type(user.password);
    cy.get('[data-test-id="reset"]').submit();
  });

  it('login, update fields with bad password, submit form', () => {
    loginGoTo(user, path);
    cy.get('#password').type(' ');
    cy.get('#new-password').type(updatedUser.password);
    cy.get('#confirm-password').type(updatedUser.password);
    cy.get('[data-test-id="reset"]').submit();

    // confirm failure
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('li.message.error').contains('Your password does not match our records');
  });

  it('login, update fields with bad new-password, submit form', () => {
    loginGoTo(user, path);
    cy.get('#password').type(user.password);
    cy.get('#new-password').type(' ');
    cy.get('#confirm-password').type(updatedUser.password);
    cy.get('[data-test-id="reset"]').submit();

    // confirm failure
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('.message.error').should('contain', 'Passwords must have a minimum of 8 characters')
      .and('contain', 'Password requires a number')
      .and('contain', 'Password requires a lowercase and upper case letter')
      .and('contain', 'Password requires a special character: *.!@$%^&(){}[]~');
  });

  it('login, update fields with mis-matched passwords, submit form', () => {
    loginGoTo(user, path);
    cy.get('#password').type(user.password);
    cy.get('#new-password').type(updatedUser.password);
    cy.get('#confirm-password').type(' ');
    cy.get('[data-test-id="reset"]').submit();

    // confirm failure
    cy.url().should('equal', `${Cypress.config('baseUrl')}${path}`);
    cy.get('.message.error').contains('Your password and confirmation password do not match');
  });

  it('login, update fields, submit form', () => {
    loginGoTo(user, path);
    cy.get('#password').type(user.password);
    cy.get('#new-password').type(updatedUser.password);
    cy.get('#confirm-password').type(updatedUser.password);
    cy.get('[data-test-id="reset"]').submit();

    // confirm successful redirect and messaging
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/account`);
    cy.get('.message.info').contains('Your password has been updated');

    // logout, confirm you can login with new password
    cy.get('.fifth form').submit();
    loginGoTo({
      username: user.username,
      password: updatedUser.password,
    }, '/user/account');
    cy.url().should('equal', `${Cypress.config('baseUrl')}/user/account`);
    cy.get('[data-test-id="username"]').contains(user.username);
  });
});
