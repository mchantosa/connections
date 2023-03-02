/* eslint-disable class-methods-use-this */
const bcrypt = require('bcrypt');
const Contact = require('./contact');
const Objective = require('./objective');
const { dbQuery } = require('./db-query');

module.exports = class ConnectionsDB {
  static PAGINATE = 10;

  constructor(session) {
    this.user = session.user;
  }

  /* AUTHENTICATING-PROCESSING, NO USER AUTHORIZATION REQUIRED */

  async getUserCredentials(usernameOrEmail) {
    const FIND_USER_CREDENTIALS = 'SELECT id, username, email FROM users WHERE username=$1 OR email=$1';
    const result = await dbQuery(FIND_USER_CREDENTIALS, usernameOrEmail);
    return result.rows[0];
  }

  async authenticate(id, password) {
    const FIND_HASHED_PASSWORD = 'SELECT password_hash FROM users WHERE id=$1';
    const result = await dbQuery(FIND_HASHED_PASSWORD, id);
    if (result.rowCount === 0) return false;
    return bcrypt.compare(password, result.rows[0].password_hash);
  }

  async existsUsername(username) {
    const FIND_USERNAME = 'SELECT username FROM users WHERE username = $1';
    const result = await dbQuery(FIND_USERNAME, username);
    return result.rowCount > 0;
  }

  async existsEmail(email) {
    const FIND_EMAIL = 'SELECT email FROM users WHERE email = $1';
    const result = await dbQuery(FIND_EMAIL, email);
    return result.rowCount > 0;
  }

  async addUser(user) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const ADD_USER = `
      INSERT INTO users (username, email, password_hash) 
      VALUES ($1, $2,'${hashedPassword}')`;
    const result = await dbQuery(ADD_USER, user.username, user.email);
    return result.rowCount > 0;
  }

  /* ACCESS USER DATA */

  async getUserNames() {
    if (!this.user) throw new Error('A session is required to access  getUserNames');
    const FIND_USER_NAMES = `
      SELECT first_name, last_name 
      FROM users
      WHERE id=$1`;
    const result = await dbQuery(FIND_USER_NAMES, this.user.id);
    return result.rows[0];
  }

  async getUser() {
    if (!this.user) throw new Error('A session is required to access  getUser');
    const GET_USER_DATA = 'SELECT * FROM users WHERE id=$1';
    const result = await dbQuery(GET_USER_DATA, this.user.id);
    return result.rows[0];
  }

  async updateUser(firstName, lastName) {
    if (!this.user) throw new Error('A session is required to access  updateUser');

    const UPDATE_USER_DATA = 'UPDATE users SET first_name=$2, last_name=$3 WHERE id=$1';
    const result = await dbQuery(UPDATE_USER_DATA, this.user.id, firstName, lastName);
    return result.rowCount > 0;
  }

  async updateUserPassword(newPassword) {
    if (!this.user) throw new Error('A session is required to access  updateUserPassword');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const UPDATE_USER_PASSWORD = 'UPDATE users SET password_hash=$2 WHERE id=$1';
    const result = await dbQuery(UPDATE_USER_PASSWORD, this.user.id, hashedPassword);
    return result.rowCount > 0;
  }

  async updateUserEmail(newEmail) {
    if (!this.user) throw new Error('A session is required to access  updateUserEmail');

    const UPDATE_USER_EMAIL = 'UPDATE users SET email=$2 WHERE id=$1';
    const result = await dbQuery(UPDATE_USER_EMAIL, this.user.id, newEmail);
    this.user.email = newEmail;
    return result.rowCount > 0;
  }

  async updateUsername(newUsername) {
    if (!this.user) throw new Error('A session is required to access  updateUsername');

    const UPDATE_USERNAME = 'UPDATE users SET username=$2 WHERE id=$1';
    const result = await dbQuery(UPDATE_USERNAME, this.user.id, newUsername);
    this.user.username = newUsername;
    return result.rowCount > 0;
  }

  async userOwnsContact(contactId) {
    if (!this.user) throw new Error('A session is required to access  userOwnsContact');

    const GET_CONTACT = 'SELECT * FROM contacts WHERE contacts.id=$1 AND user_id=$2';
    const result = await dbQuery(GET_CONTACT, +contactId, this.user.id);
    return result.rowCount > 0;
  }

  async existsContacts() {
    if (!this.user) throw new Error('A session is required to access  existsContacts');

    const FIND_CONTACT_COUNT = `
      SELECT * FROM contacts 
      WHERE user_id=$1`;
    const result = await dbQuery(FIND_CONTACT_COUNT, this.user.id);
    return result.rowCount > 0;
  }

  async getContactsCount() {
    if (!this.user) throw new Error('A session is required to access  getContactsCount');

    const FIND_CONTACT_COUNT = `
        SELECT count(*) FROM contacts 
        WHERE user_id=$1`;
    const result = await dbQuery(FIND_CONTACT_COUNT, this.user.id);
    return result.rows[0].count;
  }

  async getObjective(objectiveId) {
    if (!this.user) throw new Error('A session is required to access  getObjective');

    const GET_OBJECTIVE = 'SELECT * FROM objectives WHERE objectives.id=$1';
    const result = await dbQuery(GET_OBJECTIVE, objectiveId);
    if (result.rows.length > 0) {
      const objective = new Objective(result.rows[0]);
      objective.formatNextContactDate();
      objective.formatLastContactDate();
      return objective;
    }
    return false;
  }

  async getObjectiveByContactId(contactId) {
    if (!this.user) throw new Error('A session is required to access getObjectiveByContactId');

    const GET_OBJECTIVE = 'SELECT * FROM objectives WHERE objectives.contact_id=$1';
    const result = await dbQuery(GET_OBJECTIVE, contactId);
    if (result.rows.length > 0) {
      const objective = new Objective(result.rows[0]);
      objective.formatNextContactDate();
      objective.formatLastContactDate();
      return objective;
    }
    return false;
  }

  async packageContact(contactObj) {
    const contact = new Contact(contactObj);
    const objective = await this.getObjectiveByContactId(contact.getId());
    if (objective) contact.setObjective(objective);
    contact.formatLastConnection();
    return contact;
  }

  packageContactFromJoin(contactObj) {
    const contact = new Contact({
      id: contactObj.id,
      user_id: contactObj.user_id,
      first_name: contactObj.first_name,
      last_name: contactObj.last_name,
      preferred_medium: contactObj.preferred_medium,
      phone_number: contactObj.phone_number,
      email: contactObj.email,
      street_address_1: contactObj.street_address_1,
      street_address_2: contactObj.street_address_2,
      city: contactObj.city,
      state_code: contactObj.state_code,
      zip_code: contactObj.zip_code,
      country: contactObj.country,
      last_connection: contactObj.last_connection,
      notes: contactObj.notes,
    });
    contact.formatLastConnection();
    if (contactObj.objectives_id) {
      const objective = new Objective({
        id: contactObj.objectives_id,
        contact_id: contactObj.objectives_contact_id,
        periodicity: contactObj.objectives_periodicity,
        next_contact_date: contactObj.objectives_next_contact_date,
        last_contact_date: contactObj.objectives_last_contact_date,
        notes: contactObj.objectives_notes,
      });
      objective.formatNextContactDate();
      objective.formatLastContactDate();
      contact.setObjective(objective);
    }
    return contact;
  }

  async getContacts(pageNumber) {
    if (!this.user) throw new Error('A session is required to access  getContacts');

    let offset;
    if (!pageNumber) {
      offset = 0;
    } else {
      offset = (ConnectionsDB.PAGINATE) * pageNumber;
    }
    const GET_CONTACTS = `
      SELECT * FROM contacts 
      WHERE user_id=(SELECT id FROM users WHERE username=$1)
      ORDER BY trim(concat(last_name, first_name)) 
      LIMIT $2
      OFFSET $3`;
    const result = await dbQuery(GET_CONTACTS, this.user.username, ConnectionsDB.PAGINATE, offset);
    const contacts = [];
    for (let i = 0; i < result.rows.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      contacts.push(await this.packageContact(result.rows[i]));
    }
    return contacts;
  }

  async getContactsAll(date) {
    if (!this.user) throw new Error('A session is required to access  getContactsAll');
    const GET_CONTACTS = `SELECT contacts.id,
      contacts.user_id,
      contacts.first_name,
      contacts.last_name,
      contacts.preferred_medium,
      contacts.phone_number,
      contacts.email,
      contacts.street_address_1,
      contacts.street_address_2,
      contacts.city,
      contacts.state_code,
      contacts.zip_code,
      contacts.country,
      contacts.last_connection,
      contacts.notes,
      objectives.id                AS objectives_id,
      objectives.contact_id        AS objectives_contact_id,
      objectives.periodicity       AS objectives_periodicity,
      objectives.next_contact_date AS objectives_next_contact_date,
      objectives.last_contact_date AS objectives_last_contact_date,
      objectives.notes             AS objectives_notes
      FROM   contacts
          LEFT JOIN objectives
                ON objectives.contact_id = contacts.id
      WHERE  contacts.user_id = $1
          AND objectives.next_contact_date <= Date($2)
      ORDER  BY objectives.next_contact_date ASC, 
        objectives.last_contact_date ASC, 
        concat(lower(contacts.last_name), lower(contacts.first_name));`;
    const result = await dbQuery(GET_CONTACTS, this.user.id, date);
    const contacts = [];
    const { length } = result.rows;
    if (length > 0) {
      for (let index = 0; index < length; index += 1) {
        contacts.push(this.packageContactFromJoin(result.rows[index]));
      }
    }
    return contacts;
  }

  async getContact(contactId) {
    if (!this.user) throw new Error('A session is required to access  getContact');

    const GET_CONTACT = 'SELECT * FROM contacts WHERE contacts.id=$1';
    const result = await dbQuery(GET_CONTACT, +contactId);

    if (result.rowCount > 0) {
      return this.packageContact(result.rows[0]);
    }
    return false;
  }

  async getContactName(contactId) {
    if (!this.user) throw new Error('A session is required to access  getContactName');

    const GET_CONTACT_NAME = 'SELECT id, first_name, last_name FROM contacts WHERE contacts.id=$1';
    const result = await dbQuery(GET_CONTACT_NAME, contactId);
    return result.rows[0];
  }

  async updateContact(contact) {
    if (!this.user) throw new Error('A session is required to access  updateContact');

    const UPDATE_CONTACT_V1 = 'UPDATE contacts SET ';
    const UPDATE_CONTACT_V2 = 'UPDATE contacts SET (';
    let moreThatOneField = false;
    let UPDATE_CONTACT = '';

    const keys = [];
    const indices = [];
    const values = [];
    const { id } = contact;
    let counter = 1;

    const contactKeys = Object.keys(contact).filter((key) => !['id', 'user_id', 'objectives'].includes(key));
    if (contactKeys.length > 1) {
      moreThatOneField = true;
      UPDATE_CONTACT += UPDATE_CONTACT_V2;
    } else {
      UPDATE_CONTACT += UPDATE_CONTACT_V1;
    }

    contactKeys.forEach((key) => {
      keys.push(`${key}`);
      values.push(contact[key]);
      indices.push(`$${counter}`);
      counter += 1;
    });

    UPDATE_CONTACT += keys.join(', ');

    if (moreThatOneField) {
      UPDATE_CONTACT += `) = (${indices.join(', ')}) WHERE contacts.id=$${counter};`;
    } else {
      UPDATE_CONTACT += ` = ${indices.join(', ')} WHERE contacts.id=$${counter};`;
    }

    values.push(id);

    const result = await dbQuery(UPDATE_CONTACT, ...values);
    return result.rowCount > 0;
  }

  async createContact(contact) {
    if (!this.user) throw new Error('A session is required to access  createContact');

    let ADD_CONTACT = 'INSERT INTO contacts (';

    const { id } = this.user;
    const keys = ['user_id'];
    const indices = ['$1'];
    const values = [id];
    let counter = 2;

    const contactKeys = Object.keys(contact).filter((key) => !['id', 'user_id', 'objective'].includes(key));
    contactKeys.forEach((key) => {
      keys.push(`${key}`);
      values.push(contact[key]);
      indices.push(`$${counter}`);
      counter += 1;
    });

    ADD_CONTACT += keys.join(', ');
    ADD_CONTACT += `) VALUES(${indices.join(', ')}) RETURNING id;`;
    const result = await dbQuery(ADD_CONTACT, ...values);
    if (contact.objective) {
      await this.createObjective(contact.objective, result.rows[0].id);
    }
    if (result.rows.length > 0) return result.rows[0].id;
    return false;
  }

  async createObjective(objective, contactId) {
    if (!this.user) throw new Error('A session is required to access  createObjective');

    let ADD_OBJECTIVE = 'INSERT INTO objectives (';

    const keys = ['contact_id'];
    const indices = ['$1'];
    const values = [contactId];
    let counter = 2;

    const objectiveKeys = Object.keys(objective).filter((key) => !['id', 'contact_id'].includes(key));

    objectiveKeys.forEach((key) => {
      keys.push(`${key}`);
      values.push((objective[key]) ? (objective[key]) : null);
      indices.push(`$${counter}`);
      counter += 1;
    });

    ADD_OBJECTIVE += keys.join(', ');
    ADD_OBJECTIVE += `) VALUES(${indices.join(', ')}) RETURNING id;`;
    const result = await dbQuery(ADD_OBJECTIVE, ...values);
    if (result.rows.length > 0) return result.rows[0].id;
    return false;
  }

  async deleteContact(contactId) {
    if (!this.user) throw new Error('A session is required to access  deleteContact');

    const DELETE_CONTACT = 'DELETE FROM contacts WHERE contacts.id=$1';
    const result = await dbQuery(DELETE_CONTACT, contactId);
    return result.rowCount > 0;
  }

  async deleteObjective(objectiveId) {
    if (!this.user) throw new Error('A session is required to access  deleteObjective');

    const DELETE_OBJECTIVE = 'DELETE FROM objectives WHERE objectives.id=$1';
    const result = await dbQuery(DELETE_OBJECTIVE, objectiveId);
    return result.rowCount > 0;
  }

  async updateObjective(objective) {
    if (!this.user) throw new Error('A session is required to access  updateObjective');

    const UPDATE_OBJECTIVE_V1 = 'UPDATE objectives SET ';
    const UPDATE_OBJECTIVE_V2 = 'UPDATE objectives SET (';
    let moreThatOneField = false;
    let UPDATE_OBJECTIVE = '';

    const keys = [];
    const indices = [];
    const values = [];
    const { id } = objective;
    let counter = 1;

    const objectiveKeys = Object.keys(objective).filter((key) => !['id', 'contact_id'].includes(key));
    if (objectiveKeys.length > 1) {
      moreThatOneField = true;
      UPDATE_OBJECTIVE += UPDATE_OBJECTIVE_V2;
    } else {
      UPDATE_OBJECTIVE += UPDATE_OBJECTIVE_V1;
    }

    objectiveKeys.forEach((key) => {
      keys.push(`${key}`);
      values.push(objective[key]);
      indices.push(`$${counter}`);
      counter += 1;
    });

    UPDATE_OBJECTIVE += keys.join(', ');

    if (moreThatOneField) {
      UPDATE_OBJECTIVE += `) = (${indices.join(', ')}) WHERE objectives.id=$${counter};`;
    } else {
      UPDATE_OBJECTIVE += ` = ${indices.join(', ')} WHERE objectives.id=$${counter};`;
    }

    values.push(+id);

    const result = await dbQuery(UPDATE_OBJECTIVE, ...values);
    return result.rowCount > 0;
  }

  async contactOwnsObjective(contactId, objectiveId) {
    if (!this.user) throw new Error('A session is required to access  contactOwnsObjective');

    const GET_OBJECTIVE = 'SELECT * FROM objectives WHERE contact_id=$1 AND objectives.id=$2';
    const result = await dbQuery(GET_OBJECTIVE, +contactId, +objectiveId);
    return result.rowCount > 0;
  }
};
