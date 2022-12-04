const { Client } = require("pg");
const { dbQuery } = require("./db-query");
const bcrypt = require("bcrypt");

module.exports = class ConnectionsDB {

  constructor(session) {
    this.username = session.username;
  }

  /**
   * Returns a Promise that resolves to `true` if `username` and `password`
   * combine to identify a legitimate application user, `false` if either the
   * `username` or `password` is invalid.
  */ 
  async authenticate(username, password) {
    const FIND_HASHED_PASSWORD = "SELECT user_password FROM users" + "  WHERE user_email = $1";

    let result = await dbQuery(FIND_HASHED_PASSWORD, username);
    if (result.rowCount === 0) return false;
    
    /*return bcrypt.compare(password, result.rows[0].password);*/
    return password === result.rows[0].user_password;
  }

}