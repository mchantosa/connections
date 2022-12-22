/* eslint-disable class-methods-use-this */
const Objective = require('./objective');

module.exports = class Contact {
  static PHONE_PATTERN = '[0-9]{3}-[0-9]{3}-[0-9]{4}';

  static PLACEHOLDER_NOTES = 'Add any notes you might have here. I like to keep track of gift ideas when I notice my daughter eyeballing something.';

  constructor(contactData) {
    if (contactData) {
      this.mount(contactData);
    }
    this.mountObjectives();
  }

  mount(contactData) {
    Object.assign(this, contactData);
  }

  mountObjectives(objectivesData) {
    const objectives = [];// always has an objectives array
    if (objectivesData && objectivesData.length) { // replaces existing with new objectives
      objectivesData.forEach((objective) => {
        const wrappedObjective = new Objective(objective);
        wrappedObjective.contact_id = this.id;
        objectives.push(wrappedObjective);
      });
    } else if (this.objectives) { // replaces existing with formatted objectives
      this.objectives.forEach((objective) => {
        const formattedObjective = new Objective(objective);
        formattedObjective.contact_id = this.id;
        objectives.push(formattedObjective);
      });
    }
    this.objectives = objectives;// replace with newly build objectives
  }

  static makeContact(contactData, objectivesData) {
    const contact = new Contact(contactData);
    contact.mountObjectives(objectivesData);
    return contact;
  }

  getId() {
    return this.id;
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

  countObjectives() {
    return (this.objectives) ? this.objectives.length : 0;
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
    return Contact.PHONE_PATTERN;
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

  getPlaceholderNotes() {
    return Contact.PLACEHOLDER_NOTES;
  }
};
