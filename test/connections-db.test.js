/* eslint-disable no-undef */
const ConnectionsDB = require('../lib/connections-db');

const session = {};
let connections;

beforeAll(() => {
  // Clears the database and adds some testing data.
  // eslint-disable-next-line global-require
  const cp = require('child_process');
  cp.execSync('./lib/data/create-connections-db.sh');
  cp.execSync('./lib/data/load-users.sh');
  cp.execSync('./lib/data/load-contacts.sh');
  cp.execSync('./lib/data/load-objectives.sh');
  connections = new ConnectionsDB(session);
});

describe('Test: query accessibility', () => {
  describe('Test: unauthenticated access', () => {
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

  describe('Test: authenticated access', () => {

  });
});
