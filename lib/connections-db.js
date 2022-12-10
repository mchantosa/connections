const { Client } = require("pg");
const { dbQuery } = require("./db-query");
const bcrypt = require("bcrypt");

module.exports = class ConnectionsDB {

  constructor(session) {
    this.username = session.username;
  }

  /*Returns a Promise that (RAPT) resolves to `username` if `username` and `
  password` pair, or `email` and `password` pair, false otherwise*/
  async authenticate(userNameOrEmail, password) {
    const FIND_HASHED_PASSWORD = "SELECT username, password_hash FROM users WHERE username=$1 OR email=$1";

    let result = await dbQuery(FIND_HASHED_PASSWORD, userNameOrEmail);
    if (result.rowCount === 0) return false;
    return (bcrypt.compare(password, result.rows[0].password_hash)) ? 
      result.rows[0].username : false;
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
    const FIND_CONTACT_COUNT = `SELECT * FROM contacts WHERE user_username=$1`;
    let result = await dbQuery(FIND_CONTACT_COUNT, username);
    return result.rowCount > 0;
  }
  
    //RAPT resolves to userData
    async getUserData(username) {
      const GET_USER_DATA = `SELECT * FROM users WHERE username=$1`;
      let result = await dbQuery(GET_USER_DATA, username);
      return result.rows[0];
    }
}