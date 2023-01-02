/* eslint-disable no-undef */
const Objective = require('../lib/objective');

describe('Test: Objective', () => {
  describe('Test: Initialization', () => {
    test('Test: Falsy parameter initialization', () => {
      const objective = new Objective();
      expect(objective.mount).toBeDefined();
      expect(objective.getOccasionDate).toBeDefined();
      expect(objective instanceof Objective).toBe(true);
    });

    test('Test: Random parameter initialization', () => {
      const objective = new Objective({
        0: false,
        key1: '1',
        key2: 2,
        date: new Date('2000/02/03'),
        sum: (a, b) => a + b,
      });
      expect(objective[0]).toBe(false);
      expect(objective.key1).toBe('1');
      expect(objective.key2).toBe(2);
      expect(objective.date instanceof Date).toBe(true);
      expect(objective.sum(1, 'a')).toBe('1a');
    });

    test('Test: objectiveData parameter initialization', () => {
      const objective = new Objective({
        date_occasion: new Date('2000/02/03'),
      });
      expect(objective.getOccasionDate()).toBe('2000-02-03');
    });
  });

  describe('getOccasionDate()', () => {
    test('Test: no this.date_occasion returns undefined', () => {
      // Returns date_occasion of type Date as string formatted to YYYY-MM-DD
      const objective = new Objective();
      expect(objective.getOccasionDate()).toBeUndefined();
    });

    test('Test: formats Date date_occasion', () => {
      // Returns date_occasion of type Date as string formatted to YYYY-MM-DD
      const objective = new Objective({
        date_occasion: new Date('2000/02/03'),
      });
      expect(objective.getOccasionDate()).toBe('2000-02-03');
    });

    test('Test: formats string date_occasion', () => {
      // Returns date_occasion of type string as a string formatted to YYYY-MM-DD
      const objective = new Objective({
        date_occasion: '2000/02/03',
      });
      expect(objective.getOccasionDate()).toBe('2000-02-03');
    });

    test('Test: formats dates of year 1100 to MM-DD', () => {
      // Returns date_occasion of form "1100-MM-DD" as string formatted MM-DD
      const objective = new Objective({
        date_occasion: '1100-02-03',
      });
      expect(objective.getOccasionDate()).toBe('02-03');
    });

    test('Test: returns "Invalid date" for date_occasion of "invalid"', () => {
      // Returns 'invalid' for bad input
      const objective1 = new Objective({
        date_occasion: '',
      });
      const objective2 = new Objective({
        date_occasion: 'invalid',
      });
      expect(objective1.getOccasionDate()).toBeUndefined();
      expect(objective2.getOccasionDate()).toBe('Invalid date');
    });
  });

  describe('Test: sanitizeDate()', () => {
    test('Test: undefined', () => {
      const objective = new Objective();
      objective.sanitizeDateOccasion();
      expect(objective.date_occasion).toBeUndefined();
    });

    test('Test: 3', () => {
      expect(() => {
        const objective = new Objective({ date_occasion: 3 });
        objective.sanitizeDateOccasion();
      }).toThrow('No numbers!');
    });

    test('Test: Date object', () => {
      const objective = new Objective({ date_occasion: new Date('2022/02/20') });
      objective.sanitizeDateOccasion();
      expect(objective.date_occasion).toBe('2022-02-20');
    });

    test('Test: "11/29"', () => {
      const objective = new Objective({
        date_occasion: '11/29',
      });
      objective.sanitizeDateOccasion();
      expect(objective.date_occasion).toBe('1100-11-29');
    });

    test('Test: "1-3"', () => {
      const objective = new Objective({
        date_occasion: '1-3',
      });
      objective.sanitizeDateOccasion();
      expect(objective.date_occasion).toBe('1100-01-03');
    });

    test('Test: "2022/02/20"', () => {
      const objective = new Objective({
        date_occasion: '2022/02/20',
      });
      objective.sanitizeDateOccasion();
      expect(objective.date_occasion).toBe('2022-02-20');
    });

    test('Test: "2022-02-20"', () => {
      const objective = new Objective({
        date_occasion: '2022/02/20',
      });
      objective.sanitizeDateOccasion();
      expect(objective.date_occasion).toBe('2022-02-20');
    });

    test('Test: "2001/02/29"', () => {
      const objective = new Objective({
        date_occasion: '2001/02/29',
      });
      objective.sanitizeDateOccasion();
      expect(objective.date_occasion).toBe('invalid');
    });
  });
});

// Grab an empty test
// describe('Test: something', () => {

//   test('Test: 1+2', () => {
//     expect(1+2).toBe(3);
//   });

// })
