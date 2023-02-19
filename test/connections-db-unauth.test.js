/* eslint-disable no-undef */
const ConnectionsDB = require('../lib/connections-db');
const ConnectionsDBAdmin = require('../lib/connections-admin');

const session = {};
const connections = new ConnectionsDB(session);
const connectionsAdmin = new ConnectionsDBAdmin();

describe('Query security', () => {
  describe('Unauthenticated queries', () => {
    test('getUserCredentials(usernameOrEmail) will return a valid query result', async () => {
      const user = await connections.getUserCredentials('admin');
      expect(user.id).toBe(1);
    });

    test('authenticate(id, password) will return a valid query result', async () => {
      const authenticated = await connections.authenticate(1, 'adminPass');
      expect(authenticated).toBe(true);
    });

    test('existsUsername(username) will return a valid query result', async () => {
      const exists = await connections.existsUsername('admin');
      expect(exists).toBe(true);
    });

    test('existsEmail(email) will return a valid query result', async () => {
      const exists = await connections.existsEmail('admin@domain.com');
      expect(exists).toBe(true);
    });

    test('addUser(user) will add a user to the database', async () => {
      const user = {
        password: '12qw!@QW',
        username: 'shivaBaby',
        email: 'shivaBaby@gmail.com',
      };
      let exists = await connections.existsUsername('shivaBaby');
      expect(exists).toBeFalsy();
      await connections.addUser(user);
      exists = await connections.existsUsername('shivaBaby');
      expect(exists).toBeTruthy();
      await connectionsAdmin.deleteUser('shivaBaby');
    });
  });
  describe('Authenticated queries', () => {
    test('getUserNames() throws error', async () => {
      await expect(connections.getUserNames())
        .rejects
        .toThrow('A session is required to access  getUserNames');
    });

    test('getUserData() throws error', async () => {
      await expect(connections.getUserData())
        .rejects
        .toThrow('A session is required to access  getUserData');
    });

    test('updateUserData(firstName, lastName) throws error', async () => {
      await expect(connections.updateUserData('firstName', 'lastName'))
        .rejects
        .toThrow('A session is required to access  updateUserData');
    });

    test('updateUserPassword(newPassword) throws error', async () => {
      await expect(connections.updateUserPassword('12qw!@QW'))
        .rejects
        .toThrow('A session is required to access  updateUserPassword');
    });

    test('updateUserEmail(newEmail) throws error', async () => {
      await expect(connections.updateUserEmail('aNewEmail@domain.com'))
        .rejects
        .toThrow('A session is required to access  updateUserEmail');
    });

    test('updateUsername(newUsername) throws error', async () => {
      await expect(connections.updateUsername('shivaBaby'))
        .rejects
        .toThrow('A session is required to access  updateUsername');
    });

    test('userOwnsContact(contactId) throws error', async () => {
      await expect(connections.userOwnsContact(5))
        .rejects
        .toThrow('A session is required to access  userOwnsContact');
    });

    test('existsContacts() throws error', async () => {
      await expect(connections.existsContacts())
        .rejects
        .toThrow('A session is required to access  existsContacts');
    });

    test('getContactsCount() throws error', async () => {
      await expect(connections.getContactsCount())
        .rejects
        .toThrow('A session is required to access  getContactsCount');
    });

    test('getObjective(objectiveId) throws error', async () => {
      await expect(connections.getObjective(50))
        .rejects
        .toThrow('A session is required to access  getObjective');
    });

    test('getObjectiveByContactId(contactId) throws error', async () => {
      await expect(connections.getObjectiveByContactId(50))
        .rejects
        .toThrow('A session is required to access getObjectiveByContactId');
    });

    test('getContacts(pageNumber) throws error', async () => {
      await expect(connections.getContacts(0))
        .rejects
        .toThrow('A session is required to access  getContacts');
    });

    test('getContact(contactId, page) throws error', async () => {
      await expect(connections.getContact(5, 0))
        .rejects
        .toThrow('A session is required to access  getContact');
    });

    test('getContactName(contactId) throws error', async () => {
      await expect(connections.getContactName(2))
        .rejects
        .toThrow('A session is required to access  getContactName');
    });

    test('updateContact(contact) throws error', async () => {
      await expect(connections.updateContact({
        id: 1,
        first_name: 'shiva',
        last_name: 'baby',
      }))
        .rejects
        .toThrow('A session is required to access  updateContact');
    });

    test('createContact(contact) throws error', async () => {
      await expect(connections.createContact({
        user_id: 1,
        first_name: 'shiva',
        last_name: 'baby',
      }))
        .rejects
        .toThrow('A session is required to access  createContact');
    });

    test('createObjective(objective, contactId) throws error', async () => {
      await expect(connections.createObjective({
        occasion: 'birthday',
        date_occasion: '2003-11-20',
        periodicity: 'Weekly',
      }, 3))
        .rejects
        .toThrow('A session is required to access  createObjective');
    });

    test('deleteContact(contactId) throws error', async () => {
      await expect(connections.deleteContact(1))
        .rejects
        .toThrow('A session is required to access  deleteContact');
    });
    // deleteObjective(objectiveId)
    // updateObjective(objective)
    // contactOwnsObjective(contactId, objectiveId)
  });
});
