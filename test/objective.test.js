const Objective= require("../lib/objective");

describe('Test: Objective', () => {

  describe('Test: Initialization', () => {

    test('Test: Falsy parameter initialization', () => {
      let objective = new Objective();
      expect(objective.mount).toBeDefined();
      expect(objective.getOccasionDate).toBeDefined();
      expect(objective instanceof Objective).toBe(true);
    });
  
    test('Test: Random parameter initialization', () => {
      let objective = new Objective({
        "0" : false,
        key1: "1", 
        key2: 2,
        date: new Date('2000/02/03'),
        sum: (a, b) => { 
          return a + b;
        },
      });
      expect(objective[0]).toBe(false);
      expect(objective.key1).toBe("1");
      expect(objective.key2).toBe(2);
      expect(objective.date instanceof Date).toBe(true);
      expect(objective.sum(1, "a")).toBe("1a");
    });

    test('Test: objectiveData parameter initialization', () => {
      let objective = new Objective({
        date_occasion: new Date('2000/02/03')
      });
      expect(objective.getOccasionDate()).toBe('2000-02-03');
    });

  })

  describe('getOccasionDate()', () => {

    test('Test: formats date date_occasion', () => {
      //Returns date_occasion of type Date as string formatted to YYYY-MM-DD
      let objective = new Objective({
        date_occasion: new Date('2000/02/03')
      });
      expect(objective.getOccasionDate()).toBe('2000-02-03');
    });

    test('Test: formats string date_occasion', () => {
      //Returns date_occasion of type string as a string formatted to YYYY-MM-DD
      let objective = new Objective({
        date_occasion: '2000/02/03',
      });
      expect(objective.getOccasionDate()).toBe('2000-02-03');
    });

    test('Test: formats dates of year 1100 to MM-DD', () => {
      //Returns date_occasion of form "1100-MM-DD" as string formatted MM-DD
      let objective = new Objective({
        date_occasion: '1100-02-03',
      });
      expect(objective.getOccasionDate()).toBe('02-03');
    });

  })

});