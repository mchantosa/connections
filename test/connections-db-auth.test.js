/* eslint-disable no-undef */
const ConnectionsDB = require('../lib/connections-db');
const ConnectionsDBAdmin = require('../lib/connections-admin');
const Contact = require('../lib/contact');
const Objective = require('../lib/objective');

const session = {};
const connections = new ConnectionsDB(session);
const connectionsAdmin = new ConnectionsDBAdmin();

connections.user = {
  id: 2,
  username: 'testDeveloper',
  email: 'testdeveloper@domain.com',
};

describe('Contacts', () => {
  describe('CRUD', () => {
    describe('Given a minimal contact without objective', () => {
      const obj = {
        first_name: 'shiva',
      };
      const contact = new Contact(obj);
      let contactId;
      let dbContact;

      test('CreateContact(contact) adds contact to the database', async () => {
        contactId = await connections.createContact(contact);
        expect(contactId).toBeTruthy();
        expect(Number.isInteger(contactId)).toBeTruthy();
      });

      test('getContact(contactId) returns a well formed Contact instance', async () => {
        dbContact = await connections.getContact(contactId);
        expect(dbContact).toBeInstanceOf(Contact);
        Object.keys(contact).forEach((key) => {
          expect(contact[key]).toBe(dbContact[key]);
        });
        expect(dbContact.id).toBe(contactId);
        expect(dbContact.user_id).toBe(connections.user.id);
      });

      test('updateContact(contact) updates 2 fields', async () => {
        const objUpdate = {
          id: contactId,
          last_name: 'baby',
          notes: 'enjoys chicken',
        };
        const contactUpdates = new Contact(objUpdate);

        const updated = await connections.updateContact(contactUpdates);
        expect(updated).toBeTruthy();

        const updatedContact = await connections.getContact(contactId);
        const dbContactKeys = Object.keys(dbContact);
        const contactUpdatesKeys = Object.keys(contactUpdates);
        [...dbContactKeys, ...contactUpdatesKeys].forEach((key) => {
          if (key !== 'objective') {
            if (contactUpdatesKeys.indexOf(key) >= 0) {
              expect(updatedContact[key]).toBe(contactUpdates[key]);
            } else {
              expect(updatedContact[key]).toBe(dbContact[key]);
            }
          }
        });
        dbContact = updatedContact;
      });

      test('updateContact(contact) updates 1 field', async () => {
        const objUpdate = {
          id: contactId,
          notes: 'enjoys chicken AND tuna',
        };
        const contactUpdates = new Contact(objUpdate);

        const updated = await connections.updateContact(contactUpdates);
        expect(updated).toBeTruthy();

        const updatedContact = await connections.getContact(contactId);
        const dbContactKeys = Object.keys(dbContact);
        const contactUpdatesKeys = Object.keys(contactUpdates);
        [...dbContactKeys, ...contactUpdatesKeys].forEach((key) => {
          if (key !== 'objective') {
            if (contactUpdatesKeys.indexOf(key) >= 0) {
              expect(updatedContact[key]).toBe(contactUpdates[key]);
            } else {
              expect(updatedContact[key]).toBe(dbContact[key]);
            }
          }
        });

        dbContact = updatedContact;
      });

      test('deleteContact(contactId) removes relation from database', async () => {
        const deleted = await connections.deleteContact(contactId);
        expect(deleted).toBeTruthy();
        dbContact = await connections.getContact(contactId);
        expect(dbContact).toBeFalsy();
      });
    });

    describe('Given maximal contact without objective', () => {
      describe('CRUD', () => {
        const obj = {
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
        let contactId;
        let dbContact;

        test('createContact(contact) adds contact to the database', async () => {
          contactId = await connections.createContact(contact);
          expect(contactId).toBeTruthy();
          expect(Number.isInteger(contactId)).toBeTruthy();
        });

        test('getContact(contactId) returns a well formed Contact instance', async () => {
          dbContact = await connections.getContact(contactId);
          expect(dbContact).toBeInstanceOf(Contact);
          Object.keys(contact).forEach((key) => {
            expect(contact[key]).toBe(dbContact[key]);
          });
          expect(dbContact.id).toBe(contactId);
          expect(dbContact.user_id).toBe(connections.user.id);
        });

        test('updateContact(contact) updates 2 fields', async () => {
          const objUpdate = {
            id: contactId,
            first_name: 'my shiva',
            notes: 'enjoys chicken',
          };
          const contactUpdates = new Contact(objUpdate);

          const updated = await connections.updateContact(contactUpdates);
          expect(updated).toBeTruthy();

          const updatedContact = await connections.getContact(contactId);
          const dbContactKeys = Object.keys(dbContact);
          const contactUpdatesKeys = Object.keys(contactUpdates);
          [...dbContactKeys, ...contactUpdatesKeys].forEach((key) => {
            if (key !== 'objective') {
              if (contactUpdatesKeys.indexOf(key) >= 0) {
                expect(updatedContact[key]).toBe(contactUpdates[key]);
              } else {
                expect(updatedContact[key]).toBe(dbContact[key]);
              }
            }
          });
          dbContact = updatedContact;
        });

        test('updateContact(contact) updates 1 field', async () => {
          const objUpdate = {
            id: contactId,
            notes: 'enjoys chicken AND tuna',
          };
          const contactUpdates = new Contact(objUpdate);

          const updated = await connections.updateContact(contactUpdates);
          expect(updated).toBeTruthy();

          const updatedContact = await connections.getContact(contactId);
          const dbContactKeys = Object.keys(dbContact);
          const contactUpdatesKeys = Object.keys(contactUpdates);
          [...dbContactKeys, ...contactUpdatesKeys].forEach((key) => {
            if (key !== 'objective') {
              if (contactUpdatesKeys.indexOf(key) >= 0) {
                expect(updatedContact[key]).toBe(contactUpdates[key]);
              } else {
                expect(updatedContact[key]).toBe(dbContact[key]);
              }
            }
          });

          dbContact = updatedContact;
        });

        test('deleteContact(contactId) removes relation from database', async () => {
          const deleted = await connections.deleteContact(contactId);
          expect(deleted).toBeTruthy();
          dbContact = await connections.getContact(contactId);
          expect(dbContact).toBeFalsy();
        });
      });
    });

    describe('Given maximal contact with objective', () => {
      describe('CRUD', () => {
        const obj = {
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
        const objective = new Objective({ periodicity: 'Weekly' });
        contact.setObjective(objective);
        let contactId;
        let objectiveId;
        let dbContact;

        test('createContact(contact) adds contact to the database', async () => {
          contactId = await connections.createContact(contact);
          expect(contactId).toBeTruthy();
          expect(Number.isInteger(contactId)).toBeTruthy();
        });

        test('getContact(contactId) returns a well formed Contact instance', async () => {
          dbContact = await connections.getContact(contactId);
          const dbObjective = dbContact.getObjective();
          objectiveId = dbObjective.getId();

          expect(dbContact).toBeInstanceOf(Contact);
          expect(dbContact.getObjective()).toBeInstanceOf(Objective);
          Object.keys(contact).forEach((key) => {
            if (key !== 'objective') {
              expect(contact[key]).toBe(dbContact[key]);
            }
          });
          Object.keys(objective).forEach((key) => {
            expect(dbObjective[key]).toBe(objective[key]);
          });
          expect(dbContact.id).toBe(contactId);
          expect(dbContact.user_id).toBe(connections.user.id);
          expect(dbObjective.getContactId()).toBe(contactId);
        });

        test('updateContact(contact) updates 2 fields', async () => {
          const objUpdate = {
            id: contactId,
            first_name: 'my shiva',
            notes: 'enjoys chicken',
          };
          const contactUpdates = new Contact(objUpdate);

          const updated = await connections.updateContact(contactUpdates);
          expect(updated).toBeTruthy();

          const updatedContact = await connections.getContact(contactId);
          const dbContactKeys = Object.keys(dbContact);
          const contactUpdatesKeys = Object.keys(contactUpdates);
          [...dbContactKeys, ...contactUpdatesKeys].forEach((key) => {
            if (key !== 'objective') {
              if (contactUpdatesKeys.indexOf(key) >= 0) {
                expect(updatedContact[key]).toBe(contactUpdates[key]);
              } else {
                expect(updatedContact[key]).toBe(dbContact[key]);
              }
            }
          });

          // Objectives still match
          const updatedContactObjective = updatedContact.getObjective();
          const dbContactObjective = dbContact.getObjective();
          const updatedContactObjectiveKeys = Object.keys(updatedContactObjective);
          const dbContactObjectiveKeys = Object.keys(dbContactObjective);
          expect(updatedContactObjectiveKeys.sort()).toEqual(dbContactObjectiveKeys.sort());
          updatedContactObjectiveKeys.forEach((key) => {
            expect(updatedContactObjective[key]).toBe(dbContactObjective[key]);
          });

          dbContact = updatedContact;
        });

        test('updateContact(contact) contact updates 1 field', async () => {
          const objUpdate = {
            id: contactId,
            notes: 'enjoys chicken AND tuna',
          };
          const contactUpdates = new Contact(objUpdate);

          const updated = await connections.updateContact(contactUpdates);
          expect(updated).toBeTruthy();

          const updatedContact = await connections.getContact(contactId);
          const dbContactKeys = Object.keys(dbContact);
          const contactUpdatesKeys = Object.keys(contactUpdates);
          [...dbContactKeys, ...contactUpdatesKeys].forEach((key) => {
            if (key !== 'objective') {
              if (contactUpdatesKeys.indexOf(key) >= 0) {
                expect(updatedContact[key]).toBe(contactUpdates[key]);
              } else {
                expect(updatedContact[key]).toBe(dbContact[key]);
              }
            }
          });

          dbContact = updatedContact;
        });

        test('deleteContact(contactId) removes relation from database', async () => {
          const deleted = await connections.deleteContact(contactId);
          expect(deleted).toBeTruthy();
          dbContact = await connections.getContact(contactId);
          expect(dbContact).toBeFalsy();
          dbObjective = await connections.getObjective(objectiveId);
          expect(dbObjective).toBeFalsy();
        });
      });
    });

    describe('Given non-existent contact', () => {
      test('getContact(contactId) returns false', async () => {
        const badContact = await connections.getContact(0);
        expect(badContact).toBeFalsy();
      });

      test('deleteContact(contactId) returns false', async () => {
        const deleted = await connections.deleteContact(0);
        expect(deleted).toBeFalsy();
      });
    });
  });
  describe('Given a userId and a page number, can get a paginated list of contacts', () => {
    test('get null page for a list shorter than pagination constant', async () => {
      // constant 10, developer has no contacts
      await connectionsAdmin.deleteAllContactsFromUser('testDeveloper');
      await connections.createContact(new Contact({ first_name: 'shiva' }));
      await connections.createContact(new Contact({ last_name: 'baby' }));
      const contacts = await connections.getContacts();

      expect(contacts.length).toBe(2);
      expect(contacts[0]).toBeInstanceOf(Contact);
      expect(contacts[1]).toBeInstanceOf(Contact);

      await connectionsAdmin.deleteAllContactsFromUser('testDeveloper');
    });
  });
  describe('getContactsNames:', () => {
    beforeEach(async () => {
      await connectionsAdmin.deleteAllContactsFromUser('testDeveloper');
    });
    test('For a user with contacts, getContactsNames returns id, firstName, lastName for all user contacts', async () => {
      const objs = [
        { first_name: 'shiva', last_name: 'baby' },
        { first_name: 'birdie1' },
        { last_name: 'Birdie2' },
        { first_name: 'haku' },
        { last_name: 'Momo' },
      ];
      await Promise.all(objs.map((obj) => connections.createContact(new Contact(obj))));
      const contactsNames = await connections.getContactsNames('i');
      expect(contactsNames.length).toBe(3);
      expect(contactsNames.map((contact) => contact.name)
        .join(' | '))
        .toBe('birdie1 | Birdie2 | shiva baby');
      contactsNames.forEach((contact) => {
        expect(typeof contact.id).toBe('number');
      });
    });
    test('For a user with no contacts, getContactsNames returns false', async () => {
      const contactsNames = await connections.getContactsNames();
      expect(contactsNames).toBeFalsy();
    });
  });
  describe('getContactId:', () => {
    beforeEach(async () => {
      await connectionsAdmin.deleteAllContactsFromUser('testDeveloper');
    });
    test('getContactsID(name) returns contact.id for contact of name name', async () => {
      const id = await connections.createContact({ first_name: 'shiva', last_name: 'baby' });
      const contactId = await connections.getContactId('shiva baby');
      expect(contactId.id).toBe(id);
    });
    test('getContactsID(name) returns contact.id for contact of name name', async () => {
      const id = await connections.createContact({ last_name: 'Haku' });
      const contactId = await connections.getContactId('Haku');
      expect(contactId.id).toBe(id);
    });
    test('getContactsID(name) returns false for non existent name', async () => {
      const contactId = await connections.getContactId('sup, yo!');
      expect(contactId).toBeFalsy();
    });
  });
});

describe('Objectives', () => {
  const contact = new Contact({ first_name: 'shiva' });
  const obj = {
    periodicity: 'Weekly',
    next_contact_date: '2023-02-06',
    last_contact_date: '2023-02-01',
    notes: 'I love Shiva',
  };
  const objective = new Objective(obj);
  let contactId;
  let objectiveId;
  let dbObjective;

  describe('CRUD', () => {
    describe('Given valid objective and contactId', () => {
      test('createObjective(objective, contactId) adds an objective the the database', async () => {
        contactId = await connections.createContact(contact);
        objectiveId = await connections.createObjective(objective, contactId);

        expect(objectiveId).toBeTruthy();
        expect(Number.isInteger(objectiveId)).toBeTruthy();
      });

      test('getObjective(objectiveId) fetches objective from database', async () => {
        dbObjective = await connections.getObjective(objectiveId);

        expect(dbObjective).toBeInstanceOf(Objective);
        Object.keys(objective).forEach((key) => {
          expect(objective[key]).toBe(dbObjective[key]);
        });
        expect(dbObjective.getId()).toBe(objectiveId);
        expect(dbObjective.getContactId()).toBe(contactId);
      });

      test('getObjectiveByContactId(contactId) fetches objective from database', async () => {
        dbObjective = await connections.getObjectiveByContactId(contactId);

        expect(dbObjective).toBeInstanceOf(Objective);
        Object.keys(objective).forEach((key) => {
          expect(objective[key]).toBe(dbObjective[key]);
        });
        expect(dbObjective.getId()).toBe(objectiveId);
        expect(dbObjective.getContactId()).toBe(contactId);
      });

      test('updateObjective(objective) updates 2 fields', async () => {
        const objUpdate = {
          id: objectiveId,
          periodicity: 'Monthly',
          notes: 'coffee date',
        };
        const objectiveUpdates = new Objective(objUpdate);

        const updated = await connections.updateObjective(objectiveUpdates);
        expect(updated).toBeTruthy();

        const updatedObjective = await connections.getObjective(objectiveId);
        const dbObjectiveKeys = Object.keys(dbObjective);
        const objectiveUpdatesKeys = Object.keys(objectiveUpdates);
        [...dbObjectiveKeys, ...objectiveUpdatesKeys].forEach((key) => {
          if (objectiveUpdatesKeys.indexOf(key) >= 0) {
            expect(updatedObjective[key]).toBe(objectiveUpdates[key]);
          } else {
            expect(updatedObjective[key]).toBe(dbObjective[key]);
          }
        });

        dbObjective = updatedObjective;
      });

      test('updateObjective(objective) updates 1 field', async () => {
        const objUpdate = {
          id: objectiveId,
          next_contact_date: '2023-03-06',
        };
        const objectiveUpdates = new Objective(objUpdate);

        const updated = await connections.updateObjective(objectiveUpdates);
        expect(updated).toBeTruthy();

        const updatedObjective = await connections.getObjective(objectiveId);
        const dbObjectiveKeys = Object.keys(dbObjective);
        const objectiveUpdatesKeys = Object.keys(objectiveUpdates);
        [...dbObjectiveKeys, ...objectiveUpdatesKeys].forEach((key) => {
          if (objectiveUpdatesKeys.indexOf(key) >= 0) {
            expect(updatedObjective[key]).toBe(objectiveUpdates[key]);
          } else {
            expect(updatedObjective[key]).toBe(dbObjective[key]);
          }
        });

        dbObjective = updatedObjective;
      });

      test('deleteObjective(objectiveId) removes objective from database', async () => {
        const deleted = await connections.deleteObjective(objectiveId);
        expect(deleted).toBeTruthy();
        const deletedObjective = await connections.getObjective(objectiveId);
        expect(deletedObjective).toBeFalsy();
        await connections.deleteContact(contactId);
      });
    });

    describe('Given a non-existent objective', () => {
      test(
        'getObjective(objectiveId) returns false',
        async () => {
          const badObjective = await connections.getObjective(0);
          expect(badObjective).toBeFalsy();
        },
      );

      test(
        'getObjectiveByContactId(contactId) returns false',
        async () => {
          const badObjective = await connections.getObjectiveByContactId(0);
          expect(badObjective).toBeFalsy();
        },
      );

      test(
        'deleteObjective(objectiveId) returns false',
        async () => {
          const deleted = await connections.deleteObjective(0);
          expect(deleted).toBeFalsy();
        },
      );
    });
  });
});
