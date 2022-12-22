/* eslint-disable class-methods-use-this */
const moment = require('moment');

module.exports = class Objective {
  static TYPES = ['Periodic', 'Special Occasion'];

  static PERIOD = ['Weekly', 'Biweekly', 'Monthly', 'Quarterly', 'Annual'];

  static REMINDERS = ['1 Week', '2 Weeks', '1 Month', '2 Months'];

  static YEAR_FILLER = 1100;

  constructor(objectiveData) {
    if (objectiveData) this.mount(objectiveData);
  }

  mount(objectiveData) {
    Object.assign(this, objectiveData);
  }

  getId() {
    return this.id;
  }

  getOccasion() {
    return this.occasion;
  }

  sanitizeDateOccasion() {
    // formats this.date_occasion to undefined, M-D, MM-DD, 1100-MM-DD, or 'invalid'
    let date = this.date_occasion;
    if (!date) return; // no date is fine
    if (typeof date === 'number') throw new Error('No numbers!');
    if (date instanceof Date) {
      date = moment(date).format('YYYY-MM-DD');
      this.date_occasion = date;
    } else if (typeof date === 'string') { // MM-YY or M-Y
      if (date.match(/^[0-9]{1,2}[-/][0-9]{1,2}$/)) {
        date = date.split(/[-/]/);
        date.unshift('1100');
      } else if (date.match(/^[0-9]{4}[-/][0-9]{1,2}[-/][0-9]{1,2}$/)) { // YYYY-MM-DD
        date = date.split(/[-/]/);
      } else {
        this.date_occasion = 'invalid';
        return;
      }
      date = moment(date.join('-'));
      if (date.isValid()) {
        this.date_occasion = date.format('YYYY-MM-DD');
      } else this.date_occasion = 'invalid';
    }
  }

  getOccasionDate() {
    /*
      Expects this.date_occasion to be: undefined,
      YYYY-MM-DD, MM/DD, Date, or "invalid"
    */
    if (!this.date_occasion) return;
    const date = moment(this.date_occasion);
    if (date.year() == Objective.YEAR_FILLER) {
      return date.format('MM-DD');
    } return date.format('YYYY-MM-DD');
  }

  getPeriods() {
    return Objective.PERIOD.slice();
  }

  static getPeriods() {
    return this.PERIOD.slice();
  }

  getPeriodicity() {
    return this.periodicity;
  }

  getReminders() {
    return Objective.REMINDERS.slice();
  }

  static getReminders() {
    return this.REMINDERS.slice();
  }

  getReminder() {
    return this.reminder;
  }

  getPlaceholderNotes() {
    return 'Add notes for event planning here';
  }

  getNotes() {
    return this.notes;
  }
};
