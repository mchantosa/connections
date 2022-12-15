moment = require('moment');

module.exports = class Objective {

  static TYPES= ['periodic', 'special occasion'];
  static PERIOD= ['weekly', 'biweekly', 'monthly', 'quarterly', 'annual'];
  static YEAR_FILLER = 1100;
  
  constructor() {};

  mount(obj){
    Object.assign(this, obj);
  }

  getOccasionDate(){
    let date = moment(this.date_occasion)
    if (date.year() === Objective.YEAR_FILLER){
      return date.format('MM-DD')
    } 
    return date.format('YYYY-MM-DD');
  }

}
