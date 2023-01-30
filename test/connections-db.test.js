/* eslint-disable no-undef */
const ConnectionsDB = require('../lib/connections-db');

const session = {};
const connections = new ConnectionsDB(session);

// beforeAll(() => {
//   // Clears the database and adds some testing data.
//   // eslint-disable-next-line global-require
//   const cp = require('child_process');
//   cp.execSync('./lib/data/create-connections-db.sh');
//   cp.execSync('./lib/data/load-users.sh');
//   cp.execSync('./lib/data/load-contacts.sh');
//   cp.execSync('./lib/data/load-objectives.sh');
//   connections = new ConnectionsDB(session);
// });

describe('Test: query accessibility', () => {
  describe('Test: unauthenticated, requires no authentication access', () => {
    test('Test: getUserCredentials(usernameOrEmail) is accessible', async () => {
      const user = await connections.getUserCredentials('admin');
      expect(user.id).toBe(1);
      expect(user.username).toBe('admin');
      expect(user.email).toBe('admin@domain.com');
    });

    test('Test: authenticate(id, password) is accessible', async () => {
      const authenticated = await connections.authenticate(1, 'adminPass');
      expect(authenticated).toBe(true);
    });

    test('Test: existsUsername(username) is accessible', async () => {
      const exists = await connections.existsUsername('user');
      expect(exists).toBe(true);
    });

    test('Test: existsEmail(email) is accessible', async () => {
      const exists = await connections.existsEmail('developer@domain.com');
      expect(exists).toBe(true);
    });

    test('Test: addUser(user) is accessible', async () => {
      const user = { password: '12qw!@QW', username: 'shivaBaby', email: 'shivaBaby@gmail.com' };
      const added = await connections.addUser(user);
      expect(added).toBe(true);
      const credentials = await connections.getUserCredentials('shivaBaby');
      const authenticated = await connections.authenticate(credentials.id, '12qw!@QW');
      expect(authenticated).toBe(true);
    });
  });

  describe('Test: unauthenticated, requires authentication access', () => {
    test('Test: getUserNames() is unaccessible', async () => {
      await expect(connections.getUserNames())
        .rejects
        .toThrow('Session required to access getUserNames');
    });

    test('Test: getUserData() is unaccessible', async () => {
      await expect(connections.getUserData())
        .rejects
        .toThrow('Session required to access getUserData');
    });

    test('Test: updateUserData(firstName, lastName) is unaccessible', async () => {
      await expect(connections.updateUserData('firstName', 'lastName'))
        .rejects
        .toThrow('Session required to access updateUserData');
    });

    test('Test: updateUserPassword(newPassword) is unaccessible', async () => {
      await expect(connections.updateUserPassword('12qw!@QW'))
        .rejects
        .toThrow('Session required to access updateUserPassword');
    });

    test('Test: updateUserEmail(newEmail) is unaccessible', async () => {
      await expect(connections.updateUserEmail('aNewEmail@domain.com'))
        .rejects
        .toThrow('Session required to access updateUserEmail');
    });

    test('Test: updateUsername(newUsername) is unaccessible', async () => {
      await expect(connections.updateUsername('shivaBaby'))
        .rejects
        .toThrow('Session required to access updateUsername');
    });

    test('Test: userOwnsContact(contactId) is unaccessible', async () => {
      await expect(connections.userOwnsContact(5))
        .rejects
        .toThrow('Session required to access userOwnsContact');
    });

    test('Test: existsContacts() is unaccessible', async () => {
      await expect(connections.existsContacts())
        .rejects
        .toThrow('Session required to access existsContacts');
    });

    test('Test: getContactsCount() is unaccessible', async () => {
      await expect(connections.getContactsCount())
        .rejects
        .toThrow('Session required to access getContactsCount');
    });

    test('Test: getObjectives(contactId, pageNumber) is unaccessible', async () => {
      await expect(connections.getObjectives(1, 0))
        .rejects
        .toThrow('Session required to access getObjectives');
    });

    test('Test: getObjective(objectiveId) is unaccessible', async () => {
      await expect(connections.getObjective(50))
        .rejects
        .toThrow('Session required to access getObjective');
    });

    test('Test: getObjectivesCount() is unaccessible', async () => {
      await expect(connections.getObjectivesCount())
        .rejects
        .toThrow('Session required to access getObjectivesCount');
    });

    test('Test: getContacts(pageNumber) is unaccessible', async () => {
      await expect(connections.getContacts(0))
        .rejects
        .toThrow('Session required to access getContacts');
    });

    test('Test: getContact(contactId, page) is unaccessible', async () => {
      await expect(connections.getContact(5, 0))
        .rejects
        .toThrow('Session required to access getContact');
    });

    test('Test: getContactName(contactId) is unaccessible', async () => {
      await expect(connections.getContactName(2))
        .rejects
        .toThrow('Session required to access getContactName');
    });

    test('Test: updateContact(contact) is unaccessible', async () => {
      await expect(connections.updateContact({
        id: 1,
        first_name: 'shiva',
        last_name: 'baby',
      }))
        .rejects
        .toThrow('Session required to access updateContact');
    });

    test('Test: createContact(contact) is unaccessible', async () => {
      await expect(connections.createContact({
        user_id: 1,
        first_name: 'shiva',
        last_name: 'baby',
      }))
        .rejects
        .toThrow('Session required to access createContact');
    });

    test('Test: createObjective(objective, contactId) is unaccessible', async () => {
      await expect(connections.createObjective({
        occasion: 'birthday',
        date_occasion: '2003-11-20',
        periodicity: 'Weekly',
      }, 3))
        .rejects
        .toThrow('Session required to access createObjective');
    });

    test('Test: deleteContact(contactId) is unaccessible', async () => {
      await expect(connections.deleteContact(1))
        .rejects
        .toThrow('Session required to access deleteContact');
    });

    // test('Test: getContactName(contactId) is unaccessible', async () => {
    //   await expect(connections.getContactName(2))
    //     .rejects
    //     .toThrow('Session required to access getContactName');
    // });

    // test('Test: getContactName(contactId) is unaccessible', async () => {
    //   await expect(connections.getContactName(2))
    //     .rejects
    //     .toThrow('Session required to access getContactName');
    // });
  });
});
