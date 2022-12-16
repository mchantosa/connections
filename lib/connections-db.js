const { dbQuery } = require("./db-query");
const bcrypt = require("bcrypt");

module.exports = class ConnectionsDB {

  constructor(session) {
    this.username = session.username;
  }

  /*AUTHENTICATING-PROCESSING USER (this.username is unfedined)*/

  //Returns a Promise that (RAPT) resolves to '{username, email}'
  async getUserCredentials(userNameOrEmail) {
    const FIND_USER_CREDENTIALS = "SELECT username, email FROM users WHERE username=$1 OR email=$1";
    let result = await dbQuery(FIND_USER_CREDENTIALS, userNameOrEmail);
    return result.rows[0];
  }

  //Returns a Promise that (RAPT) resolves to 'true' if authenticated, false otherwise
  async authenticate(userNameOrEmail, password) {
    const FIND_HASHED_PASSWORD = "SELECT password_hash FROM users WHERE username=$1";
    let result = await dbQuery(FIND_HASHED_PASSWORD, userNameOrEmail);
    if (result.rowCount === 0) return false;
    return await bcrypt.compare(password, result.rows[0].password_hash);
  }

  //RAPT resolves to `true` if `username` exists, `false` otherwise 
   async existsUsername(username) {
    const FIND_USERNAME = "SELECT username FROM users WHERE username = $1";
    let result = await dbQuery(FIND_USERNAME, username);
    return result.rowCount > 0;
  }

  //RAPT resolves to `true` if `email` exists, `false` otherwise 
  async existsEmail(email) {
    const FIND_EMAIL = "SELECT email FROM users WHERE email = $1";
    let result = await dbQuery(FIND_EMAIL, email);
    return result.rowCount > 0;
  }

  //RAPT resolves to`true` if successful, `false` otherwise 
  async addUser(username, email, password) {
    let hashedPassword = await bcrypt.hash(password, 10);
    const ADD_USER = `
      INSERT INTO users (username, email, password_hash) 
      VALUES ($1, $2,'${hashedPassword}')`;
    let result = await dbQuery(ADD_USER, username, email);
    return result.rowCount > 0;
  }

  /* ACCESS USER DATA (this.username is truthy)*/

  //RAPT resolves to user first and last names
  async getUserNames() {
    const FIND_USER_NAMES = `
      SELECT first_name, last_name 
      FROM users
      WHERE username=$1`;
    let result = await dbQuery(FIND_USER_NAMES, this.username);
    return result.rows[0];
  }

  //RAPT resolves to userData
  async getUserData() {
    const GET_USER_DATA = `SELECT * FROM users WHERE username=$1`;
    let result = await dbQuery(GET_USER_DATA, this.username);
    return result.rows[0];
  }

  //RAPT resolves to true if updated
  async updateUserData(firstName, lastName) {
    const UPDATE_USER_DATA = `UPDATE users SET first_name=$2, last_name=$3 WHERE username=$1`;
    let result = await dbQuery(UPDATE_USER_DATA, this.username, firstName, lastName);
    return result.rowCount > 0;
  }

  //RAPT resolves to true if updated
  async updateUserPassword(newPassword) {
    let hashedPassword = await bcrypt.hash(newPassword, 10);
    const UPDATE_USER_PASSWORD = `UPDATE users SET password_hash=$2 WHERE username=$1`;
    let result = await dbQuery(UPDATE_USER_PASSWORD, this.username, hashedPassword);
    return result.rowCount > 0;
  }

  //RAPT resolves to true if updated
  async updateUseremail(newEmail) {
    const UPDATE_USER_EMAIL = `UPDATE users SET email=$2 WHERE username=$1`;
    let result = await dbQuery(UPDATE_USER_EMAIL, this.username, newEmail);
    return result.rowCount > 0;
  }

  //RAPT resolves to true if updated
  async updateUsername(newUsername) {
    const UPDATE_USERNAME = `UPDATE users SET username=$2 WHERE username=$1`;
    let result = await dbQuery(UPDATE_USERNAME, this.username, newUsername);
    return result.rowCount > 0;
  } 

  //RAPT resolves to true of there exists any user contacts
  async existsContacts() {
    const FIND_CONTACT_COUNT = `
      SELECT * FROM contacts 
      WHERE user_id=(SELECT id FROM users WHERE username=$1)`;
    let result = await dbQuery(FIND_CONTACT_COUNT, this.username);
    return result.rowCount > 0;
  }
  
  //RAPT resolves to objectives for a contact
  async getObjectives(contactId) {
    const GET_OBJECTIVES = `SELECT * FROM objectives WHERE contact_id=$1`;
    let result = await dbQuery(GET_OBJECTIVES, contactId);
    return result.rows;
  }

  //RAPT resolves to an objective
  async getObjective(objectiveId) {
    const GET_OBJECTIVE= `SELECT * FROM objectives WHERE objectives.id=$1 AND `;
    let result = await dbQuery(GET_OBJECTIVE, objectiveId);
    return result.rows;
  }

  //RAPT resolves to all contacts
  async getContacts() {
    const GET_CONTACTS = `
      SELECT * FROM contacts 
      WHERE user_id=(SELECT id FROM users WHERE username=$1)`;
    let result = await dbQuery(GET_CONTACTS, this.username);
    for (const contact of result.rows) {
      contact.objectives = await this.getObjectives(contact.id);
    }
    return result.rows;
  }

  //RAPT resolves to contacts data for a contact
  async getContact(contactId) {
    const GET_CONTACT = `SELECT * FROM contacts WHERE contacts.id=$1`;
    let result = await dbQuery(GET_CONTACT, contactId);
    result.rows[0].objectives = await this.getObjectives(contactId);
    return result.rows[0];
  }

  //Delete contact, RAPT true for a successful deletion
  async removeContact(contactId) {
    const DELETE_CONTACT = `DELETE FROM contacts WHERE contacts.id=$1`;
    let result = await dbQuery(DELETE_CONTACT, contactId);
    return result.rowCount > 0;
  }


}