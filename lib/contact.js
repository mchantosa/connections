module.exports = class Contact {
  
  constructor() {};

  mount(obj){
    Object.assign(this, obj);
  }

  getName(){
    return [this.first_name, this.last_name].join(' ').trim()
  }
}
