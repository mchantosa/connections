const Objective= require("../lib/objective");

describe('create by type', () => {
  // beforeAll(()=>{
  //  
  // })
  // beforeEach(() => {
  //   
  // });

  test('periodic', () => {
    const objective = new Objective(1, 'periodic');
    expect(objective.type).toBe('periodic');
  });

  test('two plus two is four', () => {
    expect(0).not.toBe(4);
  });
});