/* eslint-disable no-undef */
const moment = require('moment');
const Objective = require('../lib/objective');

describe('Objective', () => {
  describe('Objective.createEmptyObjective(objectiveData)', () => {
    test('Create an empty objective without default behavior', () => {
      const objective = Objective.createEmptyObjective({ id: 2000 });
      objective.setContactId(2);
      expect(objective).toEqual({ id: 2000, contact_id: 2 });
    });
    test('Create an empty objective without default behavior', () => {
      const objective = Objective.createEmptyObjective();
      expect(objective).toEqual({});
      expect(objective.getNextContactDate()).toBeUndefined();
    });
  });

  test('When getPeriods() is called, a copy of Objective.PERIODS is returned', () => {
    expect(Objective.getPeriods()).toEqual(Objective.PERIODS);
    expect(Objective.getPeriods() === Objective.PERIODS).toBeFalsy();
  });

  test('When getPlaceholderNotes() is called, Objective.PLACEHOLDER_NOTES is returned', () => {
    expect(Objective.getPlaceholderNotes()).toBe(Objective.PLACEHOLDER_NOTES);
  });

  describe('Objective.getPeriodTime(period)', () => {
    test('When getPeriodTime(period) is called, the reference to period from Objective.PERIOD_TIMES is returned', () => {
      expect(Objective.getPeriodTime('Weekly')).toBe(1);
      expect(Objective.getPeriodTime('Quarterly')).toBe(13);
    });

    test('When getPeriodTime(period) is called, with a period not referenced by Objective.PERIOD_TIMES, undefined is returned', () => {
      expect(Objective.getPeriodTime('Annual')).toBeUndefined();
      expect(Objective.getPeriodTime()).toBeUndefined();
    });
  });

  describe('Objective.getLastSundayPretty()', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    test('Given today is not Sunday, getLastSundayPretty() returns a the last calendar Sunday from today', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-18T00:00:00Z'));
      expect(Objective.getLastSundayPretty()).toBe('Feb-12');
    });

    test('Given today is Sunday, getLastSundayPretty() returns today Sunday', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-19T00:00:00Z'));
      expect(Objective.getLastSundayPretty()).toBe('Feb-19');
    });
  });

  describe('Objective.getThisSaturdayPretty()', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    test('Given today is not Saturday, getThisSaturdayPretty() returns a the next calendar Saturday from today', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-19T00:00:00Z'));
      expect(Objective.getThisSaturdayPretty()).toBe('Feb-25');
    });

    test('Given today is Saturday, getThisSaturdayPretty() returns today', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-18T00:00:00Z'));
      expect(Objective.getThisSaturdayPretty()).toBe('Feb-18');
    });
  });

  describe('Objective.getLastSunday()', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    test('Given today is not Sunday, getLastSunday() returns a the last calendar Sunday from today', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-18T00:00:00Z'));
      expect(Objective.getLastSunday()).toBe('2023-02-12');
    });

    test('Given today is Sunday, getLastSunday() returns today Sunday', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-19T00:00:00Z'));
      expect(Objective.getLastSunday()).toBe('2023-02-19');
    });
  });

  describe('Objective.getThisSaturday()', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    test('Given today is not Saturday, getThisSaturday() returns a the next calendar Saturday from today', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-19T00:00:00Z'));
      expect(Objective.getThisSaturday()).toBe('2023-02-25');
    });

    test('Given today is Saturday, getThisSaturday() returns today', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-18T00:00:00Z'));
      expect(Objective.getThisSaturday()).toBe('2023-02-18');
    });
  });

  describe('Objective.getNextSunday()', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    test('Given today is not Sunday, getNextSunday() returns a the next calendar Sunday from today', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-09T00:00:00Z'));
      expect(Objective.getNextSunday()).toBe('2023-02-12');
    });

    test('Given today is Sunday, getNextSunday() returns next Sunday', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-12T00:00:00Z'));
      expect(Objective.getNextSunday()).toBe('2023-02-19');
    });
  });

  describe('Objective.getNextNextContactDate(period)', () => {
    afterEach(() => {
      jest.useRealTimers();
    });
    test('Objective.getNextNextContactDate() returns last Sunday incremented by objective.periodTime', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-02T00:00:00Z'));
      expect(Objective.getNextNextContactDate('Weekly')).toBe('2023-02-05');
    });
    test('Objective.getNextNextContactDate() returns a lastSunday incremented by objective.periodTime', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-05T00:00:00Z'));
      expect(Objective.getNextNextContactDate('Monthly')).toBe('2023-03-05');
    });
  });

  describe('Objective.getMoment()', () => {
    afterEach(() => {
      jest.useRealTimers();
    });
    test('Objective.getMoment() gets now in utc formatted to YYYY-MM-DD', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-19T00:00:00Z'));
      expect(Objective.getMomentDate()).toBe('2023-02-19');
    });
  });

  describe('Objective.getSnoozeDate(date)', () => {
    afterEach(() => {
      jest.useRealTimers();
    });
    test('Objective.getSnoozeDate() returns this.getNextSunday()', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-03-09T00:00:00Z'));
      expect(Objective.getSnoozeDate()).toBe('2023-03-12');
    });
    test('Objective.getSnoozeDate() returns this.getNextSunday()', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-20T00:00:00Z'));
      expect(Objective.getSnoozeDate()).toBe('2023-02-26');
    });
    test('Objective.getSnoozeDate(date) returns this.getNextSunday()', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-20T00:00:00Z'));
      expect(Objective.getSnoozeDate('2022-05-15')).toBe('2022-05-22');
    });
  });
});

describe('Objective.prototype', () => {
  describe('Initialization', () => {
    describe('Null input', () => {
      const objective = new Objective();

      test('Returns an instance of Objective', () => {
        expect(objective).toBeInstanceOf(Objective);
      });

      test('Objective initializes with nextContactDate', () => {
        expect(objective.next_contact_date).toBeDefined();
      });
    });
    describe('Object input', () => {
      const obj = {
        id: 1,
        contact_id: 2,
        periodicity: 'Weekly',
        next_contact_date: '2023-02-06',
        last_contact_date: '2023-02-01',
        notes: 'I love Shiva',
        dummyKey: 'dummy value',
      };

      const objective = new Objective(obj);

      test('Returns an instance of Objective', () => {
        expect(objective).toBeInstanceOf(Objective);
      });

      test('Key value pairs are represented as fields in returned objective', () => {
        Object.keys(obj).forEach((key) => {
          expect(objective[key]).toBe(obj[key]);
        });
      });
    });
  });

  describe('Getters', () => {
    const obj = {
      id: 1,
      contact_id: 2,
      periodicity: 'Weekly',
      next_contact_date: '2023-02-06',
      last_contact_date: '2023-02-01',
      notes: 'I love Shiva',
    };

    const objective = new Objective(obj);

    const minimalObjective = new Objective();

    test('objective.getId() returns objective.id', () => {
      expect(objective.getId()).toBe(1);
    });

    test('objective.getContactId() returns objective.contactId', () => {
      expect(objective.getContactId()).toBe(2);
    });

    test('objective.getPeriod() returns objective.period', () => {
      expect(objective.getPeriod()).toBe('Weekly');
    });

    test('objective.getPeriodTime() returns period time reference', () => {
      expect(objective.getPeriodTime()).toBe(1);
    });

    test('objective.getNextContactDate() returns objective.nextContactDate', () => {
      expect(objective.getNextContactDate()).toBe('2023-02-06');
    });

    test('objective.getLastContactDate() returns objective.lastContactDate', () => {
      expect(objective.getLastContactDate()).toBe('2023-02-01');
    });

    describe('getLastContactDatePretty()', () => {
      test('Given objective with truthy lastContactDate, returns objective.lastContactDate', () => {
        expect(objective.getLastContactDatePretty()).toBe('2023-02-01');
      });
      test('Given minimalObjective, returns pretty statement', () => {
        expect(minimalObjective.getLastContactDatePretty())
          .toBe('No record');
      });
    });

    test('objective.getNotes() returns objective.notes', () => {
      expect(objective.getNotes()).toBe('I love Shiva');
    });

    test('objective.getPeriods() returns a copy of Objective.PERIODS', () => {
      expect(objective.getPeriods()).toEqual(Objective.PERIODS);
      expect(objective.getPeriods() === Objective.PERIODS).toBeFalsy();
    });

    test('objective.getPlaceholderNotes() returns Objective.PLACEHOLDER_NOTES', () => {
      expect(objective.getPlaceholderNotes()).toEqual(Objective.PLACEHOLDER_NOTES);
    });

    describe('getNextSunday()', () => {
      afterEach(() => {
        jest.useRealTimers();
      });

      test('Given today is not Sunday, getNextSunday() returns a the next calendar Sunday from today', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-09T00:00:00Z'));
        expect(objective.getNextSunday()).toBe('2023-02-12');
      });

      test('Given today is Sunday, getNextSunday() returns next Sunday', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-12T00:00:00Z'));
        expect(objective.getNextSunday()).toBe('2023-02-19');
      });
    });

    describe('getLastSundayPretty()', () => {
      afterEach(() => {
        jest.useRealTimers();
      });

      test('Given today is not Sunday, getLastSundayPretty() returns a the last calendar Sunday from today', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-18T00:00:00Z'));
        expect(objective.getLastSundayPretty()).toBe('Feb-12');
      });

      test('Given today is Sunday, getLastSundayPretty() returns today Sunday', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-19T00:00:00Z'));
        expect(objective.getLastSundayPretty()).toBe('Feb-19');
      });
    });

    describe('getThisSaturdayPretty()', () => {
      afterEach(() => {
        jest.useRealTimers();
      });

      test('Given today is not Saturday, getThisSaturdayPretty() returns a the next calendar Saturday from today', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-19T00:00:00Z'));
        expect(objective.getThisSaturdayPretty()).toBe('Feb-25');
      });

      test('Given today is Saturday, getThisSaturdayPretty() returns today', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-18T00:00:00Z'));
        expect(objective.getThisSaturdayPretty()).toBe('Feb-18');
      });
    });

    describe('getLastSunday()', () => {
      afterEach(() => {
        jest.useRealTimers();
      });

      test('Given today is not Sunday, getLastSunday() returns a the last calendar Sunday from today', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-18T00:00:00Z'));
        expect(objective.getLastSunday()).toBe('2023-02-12');
      });

      test('Given today is Sunday, getLastSunday() returns today Sunday', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-19T00:00:00Z'));
        expect(objective.getLastSunday()).toBe('2023-02-19');
      });
    });

    describe('getThisSaturday()', () => {
      afterEach(() => {
        jest.useRealTimers();
      });

      test('Given today is not Saturday, getThisSaturday() returns a the next calendar Saturday from today', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-19T00:00:00Z'));
        expect(objective.getThisSaturday()).toBe('2023-02-25');
      });

      test('Given today is Saturday, getThisSaturday() returns today', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-18T00:00:00Z'));
        expect(objective.getThisSaturday()).toBe('2023-02-18');
      });
    });

    describe('getSnoozeDate(date)', () => {
      afterEach(() => {
        jest.useRealTimers();
      });
      test('getSnoozeDate() returns this.getNextSunday()', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-03-09T00:00:00Z'));
        expect(objective.getSnoozeDate()).toBe('2023-03-12');
      });
      test('getSnoozeDate() returns this.getNextSunday()', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-20T00:00:00Z'));
        expect(objective.getSnoozeDate()).toBe('2023-02-26');
      });
      test('getSnoozeDate(date) returns this.getNextSunday()', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-20T00:00:00Z'));
        expect(objective.getSnoozeDate('2022-05-15')).toBe('2022-05-22');
      });
    });

    describe('getNextNextContactDate()', () => {
      afterEach(() => {
        jest.useRealTimers();
      });
      test('getNextNextContactDate() returns last Sunday incremented by objective.periodTime', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-02T00:00:00Z'));
        expect(objective.getNextNextContactDate()).toBe('2023-02-05');
      });
      test('getNextNextContactDate() returns a lastSunday incremented by objective.periodTime', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-05T00:00:00Z'));
        expect(objective.getNextNextContactDate()).toBe('2023-02-12');
      });
    });

    describe('getMoment()', () => {
      afterEach(() => {
        jest.useRealTimers();
      });
      test('Objective.getMoment() gets now in utc formatted to YYYY-MM-DD', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-19T00:00:00Z'));
        expect(objective.getMomentDate()).toBe('2023-02-19');
      });
    });
  });

  describe('Setters', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    test('setId(id) objective.id is set', () => {
      const objective = new Objective();
      objective.setId(1);
      expect(objective.getId()).toBe(1);
    });

    test('setContactId(contactId) objective.contactId is set', () => {
      const objective = new Objective();
      objective.setContactId(2000);
      expect(objective.getContactId()).toBe(2000);
    });

    describe('setNextContactDate()', () => {
      afterEach(() => {
        jest.useRealTimers();
      });

      test('When nextContactDate is not defined, setNextContactDate() sets nextContactDate to the next Sunday', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-09T00:00:00Z'));
        const objective = new Objective();
        delete objective.next_contact_date;
        expect(objective.getNextContactDate()).toBeUndefined();
        objective.setNextContactDate();
        expect(objective.getNextContactDate()).toBe('2023-02-12');
      });

      test('When nextContactDate is defined, setNextContactDate() sets next contact date to last Sunday + periodTime', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-02-09T00:00:00Z'));

        const obj = {
          id: 1,
          contact_id: 2,
          periodicity: 'Monthly',
          last_contact_date: '2023-02-01',
          notes: 'I love Shiva',
        };
        const objective = new Objective(obj);
        objective.setNextContactDate();
        expect(objective.getNextContactDate()).toBe('2023-03-05');
      });
    });

    test('When setLastContactDate() is invoked, lastContactDate is set to now in format YYYY-MM-DD', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-02-09T00:00:00Z'));
      const objective = new Objective({});
      expect(objective.getLastContactDate()).toBeUndefined();
      objective.setLastContactDate();
      expect(objective.getLastContactDate()).toBe('2023-02-09');
    });

    test('When setNotes(notes) is invoked, objective.notes is set to notes', () => {
      const objective = new Objective();
      objective.setNotes('I love my Shiva Baby');
      expect(objective.getNotes()).toBe('I love my Shiva Baby');
    });

    test('When setPeriod(period) is invoked, objective.period is set to period', () => {
      const objective = new Objective();
      objective.setPeriod('Weekly');
      expect(objective.getPeriod()).toBe('Weekly');
    });
  });

  describe('nextContactDateIsBefore(date)', () => {
    test('given date after nextContactDate, nextContactDateIsBefore(date) returns false', () => {
      const objective = new Objective({ next_contact_date: '2023-02-18' });
      expect(objective.nextContactDateIsBefore('2023-02-19')).toBeTruthy();
    });
    test('given date equal to nextContactDate, nextContactDateIsBefore(date) returns false', () => {
      const objective = new Objective({ next_contact_date: '2023-02-18' });
      expect(objective.nextContactDateIsBefore('2023-02-18')).toBeFalsy();
    });
    test('given date before to nextContactDate, nextContactDateIsBefore(date) returns false', () => {
      const objective = new Objective({ next_contact_date: '2023-02-18' });
      expect(objective.nextContactDateIsBefore('2023-02-17')).toBeFalsy();
    });
  });

  describe('nextContactDateIsAfter(date)', () => {
    test('given date after nextContactDate, nextContactDateIsAfter(date) returns true', () => {
      const objective = new Objective({ next_contact_date: '2023-02-18' });
      expect(objective.nextContactDateIsAfter('2023-02-19')).toBeFalsy();
    });
    test('given date equal to nextContactDate, nextContactDateIsAfter(date) returns false', () => {
      const objective = new Objective({ next_contact_date: '2023-02-18' });
      expect(objective.nextContactDateIsAfter('2023-02-18')).toBeFalsy();
    });
    test('given date before to nextContactDate, nextContactDateIsAfter(date) returns false', () => {
      const objective = new Objective({ next_contact_date: '2023-02-18' });
      expect(objective.nextContactDateIsAfter('2023-02-17')).toBeTruthy();
    });
  });

  describe('Format dates', () => {
    const obj = {
      id: 1,
      contact_id: 2,
      periodicity: 'Monthly',
      next_contact_date: moment('2023-02-03').utc(),
      last_contact_date: moment('2023-02-01').utc(),
      notes: 'I love Shiva',
    };
    const objective = new Objective(obj);

    test('Given a next_contact_date not formatted to YYYY-MM-DD, formatNextContactDate sets format to YYYY-MM-DD', () => {
      objective.formatNextContactDate();
      expect(objective.getNextContactDate()).toBe('2023-02-03');
    });
    test('Given a last_contact_date not formatted to YYYY-MM-DD, formatLastContactDate sets format to YYYY-MM-DD', () => {
      objective.formatLastContactDate();
      expect(objective.getLastContactDate()).toBe('2023-02-01');
    });
  });

  //   describe('Test: sanitizeDate()', () => {
  //     test('Test: undefined', () => {
  //       const objective = new Objective();
  //       objective.sanitizeDateOccasion();
  //       expect(objective.date_occasion).toBeUndefined();
  //     });

  //     test('Test: 3', () => {
  //       expect(() => {
  //         const objective = new Objective({ date_occasion: 3 });
  //         objective.sanitizeDateOccasion();
  //       }).toThrow('No numbers!');
  //     });

  //     test('Test: Date object', () => {
  //       const objective = new Objective({ date_occasion: new Date('2022/02/20') });
  //       objective.sanitizeDateOccasion();
  //       expect(objective.date_occasion).toBe('2022-02-20');
  //     });

  //     test('Test: "11/29"', () => {
  //       const objective = new Objective({
  //         date_occasion: '11/29',
  //       });
  //       objective.sanitizeDateOccasion();
  //       expect(objective.date_occasion).toBe('1100-11-29');
  //     });

  //     test('Test: "1-3"', () => {
  //       const objective = new Objective({
  //         date_occasion: '1-3',
  //       });
  //       objective.sanitizeDateOccasion();
  //       expect(objective.date_occasion).toBe('1100-01-03');
  //     });

  //     test('Test: "2022/02/20"', () => {
  //       const objective = new Objective({
  //         date_occasion: '2022/02/20',
  //       });
  //       objective.sanitizeDateOccasion();
  //       expect(objective.date_occasion).toBe('2022-02-20');
  //     });

  //     test('Test: "2022-02-20"', () => {
  //       const objective = new Objective({
  //         date_occasion: '2022/02/20',
  //       });
  //       objective.sanitizeDateOccasion();
  //       expect(objective.date_occasion).toBe('2022-02-20');
  //     });

  //     test('Test: "2001/02/29"', () => {
  //       const objective = new Objective({
  //         date_occasion: '2001/02/29',
  //       });
  //       objective.sanitizeDateOccasion();
  //       expect(objective.date_occasion).toBe('invalid');
  //     });
  //   });
  // });
});
