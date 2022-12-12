const { Client } = require("pg");
const { dbQuery } = require("./db-query");
const bcrypt = require("bcrypt");

module.exports = class ConnectionsDB {

  constructor(session) {
    this.username = session.username;
  }

  getUserCridentials
  /*Returns a Promise that (RAPT) resolves to 'username, email'*/
  async getUserCredentials(userNameOrEmail) {
    const FIND_USER_CREDENTIALS = "SELECT username, email FROM users WHERE username=$1 OR email=$1";
    let result = await dbQuery(FIND_USER_CREDENTIALS, userNameOrEmail);
    return result.rows[0];
  }

  /*Returns a Promise that (RAPT) resolves to 'true' if authenticated, false otherwise*/
  async authenticate(userNameOrEmail, password) {
    const FIND_HASHED_PASSWORD = "SELECT password_hash FROM users WHERE username=$1";
    let result = await dbQuery(FIND_HASHED_PASSWORD, userNameOrEmail);
    if (result.rowCount === 0) return false;
    return await bcrypt.compare(password, result.rows[0].password_hash);
  }

  //RAPT resolves to `true` if `username` exists, `false` otherwise 
   async existsUsername(username) {
    const FIND_USERNAME = "SELECT username FROM users" + "  WHERE username = $1";
    let result = await dbQuery(FIND_USERNAME, username);
    return result.rowCount > 0;
  }

  //RAPT resolves to `true` if `email` exists, `false` otherwise 
  async existsEmail(email) {
    const FIND_EMAIL = "SELECT email FROM users" + "  WHERE email = $1";
    let result = await dbQuery(FIND_EMAIL, email);
    return result.rowCount > 0;
  }

  //RAPT resolves to`true` if successful, `false` otherwise 
  async addUser(username, email, password) {
    let hashedPassword = await bcrypt.hash(password, 10);
    const ADD_USER = `INSERT INTO users (username, email, password_hash) VALUES ($1, $2,'${hashedPassword}')`;
    let result = await dbQuery(ADD_USER, username, email);
    return result.rowCount > 0;
  }

  //RAPT resolves to user first and last names
  async getUserNames(username) {
    const FIND_USER_NAMES = `SELECT first_name, last_name FROM users WHERE username=$1`;
    let result = await dbQuery(FIND_USER_NAMES, username);
    return result.rows[0];
  }

  //RAPT resolves to true of there exists any user contacts
  async existsContacts(username) {
    const FIND_CONTACT_COUNT = `SELECT * FROM contacts WHERE user_id=(SELECT id FROM users WHERE username=$1)`;
    let result = await dbQuery(FIND_CONTACT_COUNT, username);
    //console.log('rowCount: ' + result.rowCount);
    return result.rowCount > 0;
  }
  
    //RAPT resolves to userData
    async getUserData(username) {
      const GET_USER_DATA = `SELECT username, email, first_name, last_name FROM users WHERE username=$1`;
      let result = await dbQuery(GET_USER_DATA, username);
      return result.rows[0];
    }

    //RAPT resolves to all contacts data for a user
    async getContactData(username) {
      const GET_CONTACT_DATA = `
      SELECT contacts.id,
       first_name, last_name, contacts.birthday AS "birthday", phone_number, preferred_medium, 
       street_address_1, street_address_2, city, state_code, zip_code, country,
       periodicity 
      FROM contacts LEFT JOIN addresses 
        ON address_id=addresses.id LEFT JOIN objectives 
        ON contact_id=contacts.id 
      WHERE user_id=(SELECT id FROM users WHERE username=$1)`;
      let result = await dbQuery(GET_CONTACT_DATA, username);
      return result.rows;
    }

    //RAPT resolves to contacts data for a contact
    async getAContactData(contactId) {
      const GET_CONTACT_DATA = `
      SELECT contacts.id,
       first_name, last_name, contacts.birthday AS "birthday", phone_number, preferred_medium, 
       street_address_1, street_address_2, city, state_code, zip_code, country,
       periodicity 
      FROM contacts LEFT JOIN addresses 
        ON address_id=addresses.id LEFT JOIN objectives 
        ON contact_id=contacts.id 
      WHERE contacts.id=$1`;
      let result = await dbQuery(GET_CONTACT_DATA, contactId);
      return result.rows;
    }

    //RAPT resolves to true if updated
    async updateUserData(username, firstName, lastName) {
      const UPDATE_USER_DATA = `UPDATE users SET first_name=$2, last_name=$3 WHERE username=$1`;
      let result = await dbQuery(UPDATE_USER_DATA, username, firstName, lastName);
      return result.rowCount > 0;
    }

    //RAPT resolves to true if updated
    async updateUserPassword(username, newPassword) {
      let hashedPassword = await bcrypt.hash(newPassword, 10);
      const UPDATE_USER_PASSWORD = `UPDATE users SET password_hash=$2 WHERE username=$1`;
      let result = await dbQuery(UPDATE_USER_PASSWORD, username, hashedPassword);
      return result.rowCount > 0;
    }

    //RAPT resolves to true if updated
    async updateUseremail(username, newEmail) {
      const UPDATE_USER_EMAIL = `UPDATE users SET email=$2 WHERE username=$1`;
      let result = await dbQuery(UPDATE_USER_EMAIL, username, newEmail);
      return result.rowCount > 0;
    }

    //RAPT resolves to true if updated
    async updateUsername(username, newUsername) {
      const UPDATE_USERNAME = `UPDATE users SET username=$2 WHERE username=$1`;
      let result = await dbQuery(UPDATE_USERNAME, username, newUsername);
      return result.rowCount > 0;
    }
    


}