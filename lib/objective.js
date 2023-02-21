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

  static createEmptyObjective(objectiveData) {
    const objective = {};
    Object.setPrototypeOf(objective, this.prototype);
    Object.assign(objective, objectiveData);
    return objective;
  }

  static getPeriods() {
    return this.PERIODS.slice();
  }

  static getPeriodTime(period) {
    return this.PERIOD_TIMES[period];
  }

  static getPlaceholderNotes() {
    return this.PLACEHOLDER_NOTES;
  }

  static getLastSunday() {
    return moment().utc().day(0).format('YYYY-MM-DD');
  }

  static getThisSaturday() {
    return moment().utc().day(6).format('YYYY-MM-DD');
  }

  static getNextSunday() {
    return moment().utc().weekday(7).format('YYYY-MM-DD');
  }

  static getLastSundayPretty() {
    return moment().utc().day(0).format('MMM-DD');
  }

  static getThisSaturdayPretty() {
    return moment().utc().day(6).format('MMM-DD');
  }

  static getNextNextContactDate(period) {
    const increment = 7 * this.getPeriodTime(period);
    const newDate = moment(this.getLastSunday()).utc().weekday(increment).format('YYYY-MM-DD');
    return newDate;
  }

  static getMomentDate() {
    return moment().utc().format('YYYY-MM-DD');
  }

  static getSnoozeDate(date) {
    if (!date) return this.getNextSunday();
    return moment(date).utc().add(7, 'days').format('YYYY-MM-DD');
  }

  constructor(objectiveData) {
    Object.assign(this, objectiveData);
    if (!this.getNextContactDate()) this.setNextContactDate();
  }

  getId() {
    return this.id;
  }

  setId(id) {
    this.id = id;
  }

  getContactId() {
    return this.contact_id;
  }

  setContactId(contactId) {
    this.contact_id = contactId;
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
      this.next_contact_date = this.getNextNextContactDate();
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
    return Objective.getNextSunday();
  }

  getLastSunday() {
    return Objective.getLastSunday();
  }

  getThisSaturday() {
    return Objective.getThisSaturday();
  }

  getLastSundayPretty() {
    return Objective.getLastSundayPretty();
  }

  getThisSaturdayPretty() {
    return Objective.getThisSaturdayPretty();
  }

  getNextNextContactDate() {
    const increment = 7 * this.getPeriodTime();
    const newDate = moment(this.getLastSunday()).utc().weekday(increment).format('YYYY-MM-DD');
    return newDate;
  }

  getMomentDate() {
    return Objective.getMomentDate();
  }

  getSnoozeDate(date) {
    return Objective.getSnoozeDate(date);
  }

  nextContactDateIsAfter(date) {
    return moment(this.getNextContactDate()).utc().isAfter(moment(date).utc());
  }

  nextContactDateIsBefore(date) {
    return moment(this.getNextContactDate()).utc().isBefore(moment(date).utc());
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
};
