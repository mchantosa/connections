/* eslint-disable class-methods-use-this */
const moment = require('moment');

module.exports = class Objective {
  static PERIODS = ['Weekly', 'Biweekly', 'Monthly', 'Quarterly'];

  static PERIOD_TIMES = {
    Weekly: 1,
    Biweekly: 2,
    Monthly: 4,
    Quarterly: 13,
  };

  static PLACEHOLDER_NOTES = '- Remember to ask how [ ? ] went. \n- Say thank you for [ ? ]';

  static getPeriods() {
    return this.PERIODS.slice();
  }

  static getPeriodTime(period) {
    return this.PERIOD_TIMES[period];
  }

  static getPlaceholderNotes() {
    return this.PLACEHOLDER_NOTES;
  }

  constructor(objectiveData) {
    Object.assign(this, objectiveData);
    if (!this.getNextContactDate()) this.setNextContactDate();
  }

  getId() {
    return this.id;
  }

  getContactId() {
    return this.contact_id;
  }

  getPeriod() {
    return this.periodicity;
  }

  setPeriod(period) {
    this.periodicity = period;
  }

  getPeriodTime() {
    return Objective.getPeriodTime(this.periodicity);
  }

  getNextContactDate() {
    return this.next_contact_date;
  }

  setNextContactDate() {
    if (!this.getNextContactDate()) {
      this.next_contact_date = this.getNextSunday();
    } else {
      this.next_contact_date = this.addPeriodTimeToNextContactDate();
    }
  }

  getLastContactDate() {
    return this.last_contact_date;
  }

  getLastContactDatePretty() {
    if (this.last_contact_date) return this.last_contact_date;
    return 'No record';
  }

  setLastContactDate() {
    this.last_contact_date = moment().utc().format('YYYY-MM-DD');
  }

  getNotes() {
    return this.notes;
  }

  setNotes(notes) {
    this.notes = notes;
  }

  getPeriods() {
    return Objective.getPeriods();
  }

  getPlaceholderNotes() {
    return Objective.getPlaceholderNotes();
  }

  getNextSunday() {
    const today = moment().utc();
    const day = today.day();
    return today.add(7 - day, 'days')
      .format('YYYY-MM-DD');
  }

  addPeriodTimeToNextContactDate() {
    return moment(this.getNextContactDate()).utc()
      .add(this.getPeriodTime(), 'weeks')
      .format('YYYY-MM-DD');
  }

  formatNextContactDate() {
    if (this.next_contact_date) {
      this.next_contact_date = moment(this.next_contact_date).utc().format('YYYY-MM-DD');
    }
  }

  formatLastContactDate() {
    if (this.last_contact_date) {
      this.last_contact_date = moment(this.last_contact_date).utc().format('YYYY-MM-DD');
    }
  }

  // sanitizeDateOccasion() {
  //   // formats this.date_occasion to undefined, M-D, MM-DD, 1100-MM-DD, or 'invalid'
  //   let date = this.date_occasion;
  //   if (!date) return; // no date is fine
  //   if (typeof date === 'number') throw new Error('No numbers!');
  //   if (date instanceof Date) {
  //     date = moment(date).format('YYYY-MM-DD');
  //     this.date_occasion = date;
  //   } else if (typeof date === 'string') { // MM-YY or M-Y
  //     if (date.match(/^[0-9]{1,2}[-/][0-9]{1,2}$/)) {
  //       date = date.split(/[-/]/);
  //       date.unshift('1100');
  //     } else if (date.match(/^[0-9]{4}[-/][0-9]{1,2}[-/][0-9]{1,2}$/)) { // YYYY-MM-DD
  //       date = date.split(/[-/]/);
  //     } else {
  //       this.date_occasion = 'invalid';
  //       return;
  //     }
  //     date = moment(date.join('-'));
  //     if (date.isValid()) {
  //       this.date_occasion = date.format('YYYY-MM-DD');
  //     } else this.date_occasion = 'invalid';
  //   }
  // }

  // getReminders() {
  //   return Objective.REMINDERS.slice();
  // }
};
