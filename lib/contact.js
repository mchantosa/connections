/* eslint-disable class-methods-use-this */
const moment = require('moment');
const Objective = require('./objective');

module.exports = class Contact {
  static PHONE_PATTERN = '[0-9]{3}-[0-9]{3}-[0-9]{4}';

  static PLACEHOLDER_NOTES = 'Add any notes you might have here. I like to keep track of gift ideas when I notice my daughter eyeballing something.';

  static getPhonePattern() {
    return this.PHONE_PATTERN;
  }

  static getPlaceholderNotes() {
    return this.PLACEHOLDER_NOTES;
  }

  constructor(contact) {
    Object.assign(this, contact);
  }

  getId() {
    return this.id;
  }

  getObjective() {
    if (this.objective) {
      return new Objective({ ...this.objective });
    }
    return this.objective;
  }

  setObjective(objective) {
    this.objective = objective;
  }

  getName() {
    return [this.first_name, this.last_name].join(' ').trim();
  }

  getFirstNamePretty() {
    return (this.first_name) ? this.first_name : 'none';
  }

  getLastNamePretty() {
    return (this.last_name) ? this.last_name : 'none';
  }

  getPreferredMediumPretty() {
    return (this.preferred_medium) ? this.preferred_medium : 'none';
  }

  getPhoneNumberPretty() {
    return (this.phone_number) ? this.phone_number : 'none';
  }

  getEmailPretty() {
    return (this.email) ? this.email : 'none';
  }

  getAddressPretty() {
    let address = '';
    address += (this.street_address_1) ? this.street_address_1 : '';
    address += (this.street_address_2) ? `\n${this.street_address_2}` : '';
    address += `\n${(this.city) ? `${this.city}, ` : ''}${(this.state_code) ? this.state_code : ''} ${(this.zip_code) ? this.zip_code : ''}`;
    return (address.trim()) || 'none';
  }

  getFirstName() {
    return this.first_name;
  }

  getLastName() {
    return this.last_name;
  }

  getPreferredMedium() {
    return this.preferred_medium;
  }

  getPhoneNumber() {
    return this.phone_number;
  }

  getPhonePattern() {
    return Contact.getPhonePattern();
  }

  getEmail() {
    return this.email;
  }

  getStreetAddress1() {
    return this.street_address_1;
  }

  getStreetAddress2() {
    return this.street_address_2;
  }

  getCity() {
    return this.city;
  }

  getState() {
    return this.state_code;
  }

  getZipcode() {
    return this.zip_code;
  }

  getCountry() {
    return this.country;
  }

  getNotes() {
    return this.notes;
  }

  getLastConnection() {
    return this.last_connection;
  }

  getPlaceholderNotes() {
    return Contact.getPlaceholderNotes();
  }

  formatLastConnection() {
    if (this.last_connection) {
      this.last_connection = moment(this.last_connection).utc().format('YYYY-MM-DD');
    }
  }
};
