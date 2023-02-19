/* eslint-disable class-methods-use-this */
const { dbQuery } = require('./db-query');

module.exports = class ConnectionsDB {
  async getUser(id) {
    const GET_USER = 'SELECT * FROM users WHERE id=$1';
    const result = await dbQuery(GET_USER, id);
    return result.rows[0];
  }

  async deleteUser(username) {
    const DELETE_USER = 'DELETE FROM users WHERE username=$1';
    const result = await dbQuery(DELETE_USER, username);
    return result.rowCount > 0;
  }

  async deleteAllContactsFromUser(username) {
    const GET_USER_ID = 'SELECT id FROM users WHERE username=$1';
    const DELETE_ALL_CONTACTS = 'DELETE FROM contacts WHERE user_id=$1';
    const userIdReturn = await dbQuery(GET_USER_ID, username);
    const userId = userIdReturn.rows[0].id;
    const result = await dbQuery(DELETE_ALL_CONTACTS, userId);
    return result.rowCount > 0;
  }
};
