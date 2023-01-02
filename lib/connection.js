const moment = require('moment');

module.exports = class Connection {
  constructor(connection) {
    this.dateOfEvent = connection.dateOfEvent;
    this.dateOfNextContact = connection.dateOfNextContact;
    this.dateOfLastContact = connection.dateOfLastContact;
    this.dateOfReminder = connection.dateOfReminder;
  }

  snooze() {
    //
  }

  markComplete() {
    //
  }

  static findSunday() {
    return moment().day(0).format('MMM-DD');
  }

  static findSaturday() {
    return moment().day(6).format('MMM-DD');
  }
};
