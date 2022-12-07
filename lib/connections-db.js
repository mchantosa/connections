const { Client } = require("pg");
const { dbQuery } = require("./db-query");
const bcrypt = require("bcrypt");

module.exports = class ConnectionsDB {

  constructor(session) {
    this.username = session.username;
  }

  //Returns a Promise that resolves to `true` if `username` and `password` pair, false otherwise
  async authenticate(username, password) {
    const FIND_HASHED_PASSWORD = "SELECT user_password FROM users" + "  WHERE user_email = $1";

    let result = await dbQuery(FIND_HASHED_PASSWORD, username);
    if (result.rowCount === 0) return false;
    return bcrypt.compare(password, result.rows[0].user_password);
  }

  // Returns a Promise that resolves to `true` if `username` exists, `false` otherwise 
   async existsUsername(username) {
    const FIND_USERNAME = "SELECT user_email FROM users" + "  WHERE user_email = $1";

    let result = await dbQuery(FIND_USERNAME, username);
    return result.rowCount > 0;
  }

  // Returns a Promise that resolves to `true` if `username` exists, `false` otherwise 
  async addUser(username, password) {
    let hashedPassword = await bcrypt.hash(password, 10);
    const ADD_USER = `INSERT INTO users (user_email, user_password) VALUES ($1, '${hashedPassword}')`;

    let result = await dbQuery(ADD_USER, username);
    return result.rowCount > 0;
  }

}