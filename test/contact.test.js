/* eslint-disable no-undef */
const moment = require('moment');
const Contact = require('../lib/contact');
const Objective = require('../lib/objective');

describe('Contact', () => {
  test('getPhonePattern() returns Contact.PHONE_PATTERN', () => {
    expect(Contact.getPhonePattern()).toBe(Contact.PHONE_PATTERN);
  });

  test('getPlaceholderNotes() returns Contact.PLACEHOLDER_NOTES', () => {
    expect(Contact.getPlaceholderNotes()).toBe(Contact.PLACEHOLDER_NOTES);
  });
});

describe('Contact.prototype', () => {
  describe('Initialization', () => {
    describe('Null input', () => {
      const contact = new Contact();
      test('Returns an instance of Contact', () => {
        expect(contact).toBeInstanceOf(Contact);
      });
    });
    describe('Object input', () => {
      const obj = {
        id: 1,
        user_id: 2,
        first_name: 'shiva',
        last_name: 'baby',
        preferred_medium: 'chicken',
        phone_number: '123-456-7890',
        email: 'shivababy@gmail.com',
        street_address_1: 'a pretty street',
        street_address_2: 'a cute apt',
        city: 'Reston',
        state_code: 'VA',
        zip_code: '98765',
        country: 'United States',
        last_connection: '1000-01-01',
        notes: 'tuna also works',
      };
      const contact = new Contact(obj);
      test('Returns an instance of Contact', () => {
        expect(contact).toBeInstanceOf(Contact);
      });
      test('key value pairs are represented as fields in returned contact', () => {
        Object.keys(obj).forEach((key) => {
          expect(contact[key]).toBe(obj[key]);
        });
      });
    });
  });

  describe('Getters', () => {
    const obj = {
      id: 1,
      user_id: 2,
      first_name: 'shiva',
      last_name: 'baby',
      preferred_medium: 'chicken',
      phone_number: '123-456-7890',
      email: 'shivababy@gmail.com',
      street_address_1: 'a pretty street',
      street_address_2: 'a cute apt',
      city: 'Reston',
      state_code: 'VA',
      zip_code: '98765',
      country: 'United States',
      last_connection: '1000-01-01',
      notes: 'tuna also works',
    };
    const contact = new Contact(obj);
    const objective = new Objective();
    contact.setObjective(objective);

    const minimalContact = new Contact({ first_name: 'shiva' });

    test('getId() returns contact.id', () => {
      expect(contact.getId()).toBe(1);
    });

    test('getObjective() returns a copy of objective', () => {
      const returnedObjective = contact.getObjective();
      expect(returnedObjective !== contact.objective).toBeTruthy();
      expect(returnedObjective).toEqual(contact.objective);
      expect(returnedObjective).toBeInstanceOf(Objective);
    });

    test('minimalContact getObjective() returns undefined', () => {
      const returnedObjective = minimalContact.getObjective();
      expect(returnedObjective).toBeUndefined();
    });
    describe('getName()', () => {
      test('getName() returns join of contact.first_name and contact.last_name', () => {
        expect(contact.getName()).toBe('baby, shiva');
      });
      test('getName() contact.first_name if no contact.last_name', () => {
        firstNameContact = new Contact({ first_name: 'shiva' });
        expect(firstNameContact.getName()).toBe('shiva');
      });
      test('getName() returns contact.last_name if no first name', () => {
        lastNameContact = new Contact({ last_name: 'shiva' });
        expect(lastNameContact.getName()).toBe('shiva');
      });
    });
    test('getFirstName() returns contact.first_name', () => {
      expect(contact.getFirstName()).toBe('shiva');
    });

    test('getLastName() returns contact.last_name', () => {
      expect(contact.getLastName()).toBe('baby');
    });

    test('getPreferredMedium() returns contact.preferredMedium', () => {
      expect(contact.getPreferredMedium()).toBe('chicken');
    });

    test('getPhoneNumber()', () => {
      expect(contact.getPhoneNumber()).toBe('123-456-7890');
    });

    test('getPhonePattern() returns Contact.PHONE_PATTERN', () => {
      expect(contact.getPhonePattern()).toBe(Contact.PHONE_PATTERN);
    });

    test('getEmail() returns contact.email', () => {
      expect(contact.getEmail()).toBe('shivababy@gmail.com');
    });

    test('getStreetAddress1() returns contact.street_address_1', () => {
      expect(contact.getStreetAddress1()).toBe(contact.street_address_1);
    });

    test('getStreetAddress2() returns contact.street_address_2', () => {
      expect(contact.getStreetAddress2()).toBe(contact.street_address_2);
    });

    test('getCity() returns contact.city', () => {
      expect(contact.getCity()).toBe('Reston');
    });

    test('getState() returns contact.state_code', () => {
      expect(contact.getState()).toBe('VA');
    });

    test('getZipcode() returns contact.zip_code', () => {
      expect(contact.getZipcode()).toBe('98765');
    });

    test('getCountry() returns contact.country', () => {
      expect(contact.getCountry()).toBe('United States');
    });

    test('getNotes() returns contact.notes', () => {
      expect(contact.getNotes()).toBe('tuna also works');
    });

    test('getLastConnection() returns contact.last_connection', () => {
      expect(contact.getLastConnection()).toBe('1000-01-01');
    });

    test('getPlaceholderNotes() returns Contact.PLACEHOLDER_NOTES', () => {
      expect(contact.getPlaceholderNotes()).toBe(Contact.PLACEHOLDER_NOTES);
    });

    // getFirstNamePretty()

    // getLastNamePretty()

    // getPreferredMediumPretty()

    // getPhoneNumberPretty()

    // getEmailPretty()

    // getAddressPretty()
  });

  describe('Setters', () => {
    test('setObjective(objective) sets contact.objective to reference objective', () => {
      const contact = new Contact();
      const objective = new Objective();
      contact.setObjective(objective);
      expect(contact.objective === objective).toBeTruthy();
    });
  });

  describe('Format dates', () => {
    const obj = {
      first_name: 'shiva',
      last_connection: moment('2023-02-03').utc(),
    };
    const contact = new Contact(obj);

    test('Given a last_connection not formatted to YYYY-MM-DD, formatLastConnection sets format to YYYY-MM-DD', () => {
      contact.formatLastConnection();
      expect(contact.getLastConnection()).toBe('2023-02-03');
    });
  });
});
