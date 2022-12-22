/* eslint-disable class-methods-use-this */
const bcrypt = require('bcrypt');
const { dbQuery } = require('./db-query');

module.exports = class ConnectionsDB {
  static PAGINATE = 9;

  constructor(session) {
    this.username = session.username;
  }

  /* AUTHENTICATING-PROCESSING USER (this.username is undefined) */

  // Returns a Promise that (RAPT) resolves to '{username, email}'
  async getUserCredentials(userNameOrEmail) {
    const FIND_USER_CREDENTIALS = 'SELECT username, email FROM users WHERE username=$1 OR email=$1';
    const result = await dbQuery(FIND_USER_CREDENTIALS, userNameOrEmail);
    return result.rows[0];
  }

  // Returns a Promise that (RAPT) resolves to 'true' if authenticated, false otherwise
  async authenticate(userNameOrEmail, password) {
    const FIND_HASHED_PASSWORD = 'SELECT password_hash FROM users WHERE username=$1';
    const result = await dbQuery(FIND_HASHED_PASSWORD, userNameOrEmail);
    if (result.rowCount === 0) return false;
    return bcrypt.compare(password, result.rows[0].password_hash);
  }

  // RAPT resolves to `true` if `username` exists, `false` otherwise
  async existsUsername(username) {
    const FIND_USERNAME = 'SELECT username FROM users WHERE username = $1';
    const result = await dbQuery(FIND_USERNAME, username);
    return result.rowCount > 0;
  }

  // RAPT resolves to `true` if `email` exists, `false` otherwise
  async existsEmail(email) {
    const FIND_EMAIL = 'SELECT email FROM users WHERE email = $1';
    const result = await dbQuery(FIND_EMAIL, email);
    return result.rowCount > 0;
  }

  // RAPT resolves to`true` if successful, `false` otherwise
  async addUser(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const ADD_USER = `
      INSERT INTO users (username, email, password_hash) 
      VALUES ($1, $2,'${hashedPassword}')`;
    const result = await dbQuery(ADD_USER, username, email);
    return result.rowCount > 0;
  }

  /* ACCESS USER DATA (this.username is truthy) */

  // RAPT resolves to user first and last names
  async getUserNames() {
    const FIND_USER_NAMES = `
      SELECT first_name, last_name 
      FROM users
      WHERE username=$1`;
    const result = await dbQuery(FIND_USER_NAMES, this.username);
    return result.rows[0];
  }

  // RAPT resolves to user.id
  async getUserId(username) {
    const GET_USER_ID = 'SELECT id FROM users WHERE username=$1';
    let result;
    if (username) {
      result = await dbQuery(GET_USER_ID, username);
    } else result = await dbQuery(GET_USER_ID, this.username);

    return result.rows[0].id;
  }

  // RAPT resolves to userData
  async getUserData() {
    const GET_USER_DATA = 'SELECT * FROM users WHERE username=$1';
    const result = await dbQuery(GET_USER_DATA, this.username);
    return result.rows[0];
  }

  // RAPT resolves to true if updated
  async updateUserData(firstName, lastName) {
    const UPDATE_USER_DATA = 'UPDATE users SET first_name=$2, last_name=$3 WHERE username=$1';
    const result = await dbQuery(UPDATE_USER_DATA, this.username, firstName, lastName);
    return result.rowCount > 0;
  }

  // RAPT resolves to true if updated
  async updateUserPassword(newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const UPDATE_USER_PASSWORD = 'UPDATE users SET password_hash=$2 WHERE username=$1';
    const result = await dbQuery(UPDATE_USER_PASSWORD, this.username, hashedPassword);
    return result.rowCount > 0;
  }

  // RAPT resolves to true if updated
  async updateUserEmail(newEmail) {
    const UPDATE_USER_EMAIL = 'UPDATE users SET email=$2 WHERE username=$1';
    const result = await dbQuery(UPDATE_USER_EMAIL, this.username, newEmail);
    return result.rowCount > 0;
  }

  // RAPT resolves to true if updated
  async updateUsername(newUsername) {
    const UPDATE_USERNAME = 'UPDATE users SET username=$2 WHERE username=$1';
    const result = await dbQuery(UPDATE_USERNAME, this.username, newUsername);
    return result.rowCount > 0;
  }

  async userOwnsContact(contactId) {
    const GET_CONTACT = 'SELECT * FROM contacts WHERE contacts.id=$1 AND user_id=$2';
    const userId = await this.getUserId();
    const result = await dbQuery(GET_CONTACT, +contactId, userId);
    return result.rowCount > 0;
  }

  // RAPT resolves to true of there exists any user contacts
  async existsContacts() {
    const FIND_CONTACT_COUNT = `
      SELECT * FROM contacts 
      WHERE user_id=(SELECT id FROM users WHERE username=$1)`;
    const result = await dbQuery(FIND_CONTACT_COUNT, this.username);
    return result.rowCount > 0;
  }

  // RAPT resolves to true of there exists any user contacts
  async getContactsCount() {
    const FIND_CONTACT_COUNT = `
        SELECT count(*) FROM contacts 
        WHERE user_id=(SELECT id FROM users WHERE username=$1)`;
    const result = await dbQuery(FIND_CONTACT_COUNT, this.username);
    return result.rows[0].count;
  }

  // RAPT resolves to objectives for a contact
  async getObjectives(contactId, pageNumber) {
    let offset;
    if (!pageNumber) {
      offset = 0;
    } else {
      offset = (ConnectionsDB.PAGINATE) * pageNumber;
    }
    const GET_OBJECTIVES = `SELECT * FROM objectives WHERE contact_id=$1 
    ORDER BY lower(occasion)
    LIMIT $2
    OFFSET $3`;
    const result = await dbQuery(GET_OBJECTIVES, contactId, ConnectionsDB.PAGINATE, offset);
    return result.rows;
  }

  // RAPT resolves to an objective
  async getObjective(objectiveId) {
    const GET_OBJECTIVE = 'SELECT * FROM objectives WHERE objectives.id=$1';
    const result = await dbQuery(GET_OBJECTIVE, objectiveId);
    return result.rows[0];
  }

  // RAPT resolves to an objective
  async getObjectivesCount(contactId) {
    const GET_OBJECTIVE_COUNT = 'SELECT count(id) FROM objectives WHERE contact_id=$1';
    const result = await dbQuery(GET_OBJECTIVE_COUNT, contactId);
    return result.rows[0].count;
  }

  // RAPT resolves to all contacts
  async getContacts(pageNumber) {
    let offset;
    if (!pageNumber) {
      offset = 0;
    } else {
      offset = (ConnectionsDB.PAGINATE) * pageNumber;
    }
    const GET_CONTACTS = `
      SELECT * FROM contacts 
      WHERE user_id=(SELECT id FROM users WHERE username=$1)
      ORDER BY concat(lower(first_name), lower(last_name))
      LIMIT $2
      OFFSET $3`;
    const result = await dbQuery(GET_CONTACTS, this.username, ConnectionsDB.PAGINATE, offset);
    // linter doesn't recognize I can't use an await method in a foreach
    // eslint-disable-next-line no-restricted-syntax
    for (const contact of result.rows) {
      // linter also doesn't want me to await in a loop
      // eslint-disable-next-line no-await-in-loop
      const objectivesResult = await this.getObjectivesCount(contact.id);
      contact.objectivesCount = objectivesResult;
    }
    return result.rows;
  }

  // RAPT resolves to contacts data for a contact
  async getContact(contactId, page) {
    const GET_CONTACT = 'SELECT * FROM contacts WHERE contacts.id=$1';
    const result = await dbQuery(GET_CONTACT, +contactId);
    const objectives = await this.getObjectives(contactId, page);
    result.rows[0].objectives = objectives;
    return result.rows[0];
  }

  // RAPT resolves to contact {id, first_name, last_name}
  async getContactName(contactId) {
    const GET_CONTACT_NAME = 'SELECT id, first_name, last_name FROM contacts WHERE contacts.id=$1';
    const result = await dbQuery(GET_CONTACT_NAME, contactId);
    return result.rows[0];
  }

  // RAPT resolves to contacts data for a contact
  async updateContact(contact) {
    let UPDATE_CONTACT = 'UPDATE contacts SET (';

    const keys = [];
    const indices = [];
    const values = [];
    const { id } = contact;
    let counter = 1;

    const contactKeys = Object.keys(contact).filter((key) => !['id', 'user_id', 'objectives'].includes(key));
    contactKeys.forEach((key) => {
      keys.push(`${key}`);
      values.push(contact[key]);
      indices.push(`$${counter}`);
      counter += 1;
    });

    UPDATE_CONTACT += keys.join(', ');
    UPDATE_CONTACT += `) = (${indices.join(', ')}) WHERE contacts.id=$${counter};`;
    values.push(id);

    const result = await dbQuery(UPDATE_CONTACT, ...values);
    return result.rowCount > 0;
  }

  // RAPT resolves to contacts data for a contact
  async createContact(contact) {
    let ADD_CONTACT = 'INSERT INTO contacts (';

    const id = await this.getUserId();
    const keys = ['user_id'];
    const indices = ['$1'];
    const values = [id];
    let counter = 2;

    const contactKeys = Object.keys(contact).filter((key) => !['id', 'user_id', 'objectives'].includes(key));
    contactKeys.forEach((key) => {
      keys.push(`${key}`);
      values.push(contact[key]);
      indices.push(`$${counter}`);
      counter += 1;
    });

    ADD_CONTACT += keys.join(', ');
    ADD_CONTACT += `) VALUES(${indices.join(', ')});`;
    const result = await dbQuery(ADD_CONTACT, ...values);
    return result.rowCount > 0;
  }

  // RAPT resolves to contacts data for a contact
  async createObjective(objective, contactId) {
    let ADD_OBJECTIVE = 'INSERT INTO objectives (';

    const keys = ['contact_id'];
    const indices = ['$1'];
    const values = [contactId];
    let counter = 2;
    // const { id } = contact;

    const objectiveKeys = Object.keys(objective).filter((key) => !['id', 'contact_id'].includes(key));

    objectiveKeys.forEach((key) => {
      keys.push(`${key}`);
      values.push((objective[key]) ? (objective[key]) : null);
      indices.push(`$${counter}`);
      counter += 1;
    });

    ADD_OBJECTIVE += keys.join(', ');
    ADD_OBJECTIVE += `) VALUES(${indices.join(', ')});`;
    const result = await dbQuery(ADD_OBJECTIVE, ...values);
    return result.rowCount > 0;
  }

  // Delete contact, RAPT true for a successful deletion
  async deleteContact(contactId) {
    const DELETE_CONTACT = 'DELETE FROM contacts WHERE contacts.id=$1';
    const result = await dbQuery(DELETE_CONTACT, contactId);
    return result.rowCount > 0;
  }

  // Delete objective, RAPT true for a successful deletion
  async deleteObjective(objectiveId) {
    const DELETE_OBJECTIVE = 'DELETE FROM objectives WHERE objectives.id=$1';
    const result = await dbQuery(DELETE_OBJECTIVE, objectiveId);
    return result.rowCount > 0;
  }

  // RAPT resolves to true if objective updated
  async updateObjective(objective) {
    let UPDATE_OBJECTIVE = 'UPDATE objectives SET (';

    const keys = [];
    const indices = [];
    const values = [];
    const { id } = objective;
    let counter = 1;
    const objectiveKeys = Object.keys(objective).filter((key) => !['id', 'contact_id'].includes(key));

    objectiveKeys.forEach((key) => {
      keys.push(`${key}`);
      values.push(objective[key]);
      indices.push(`$${counter}`);
      counter += 1;
    });

    UPDATE_OBJECTIVE += keys.join(', ');
    UPDATE_OBJECTIVE += `) = (${indices.join(', ')}) WHERE objectives.id=$${counter};`;
    values.push(+id);

    const result = await dbQuery(UPDATE_OBJECTIVE, ...values);
    return result.rowCount > 0;
  }
};
