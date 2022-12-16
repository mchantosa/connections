const Objective = require('./objective');


module.exports = class Contact {
  
  static PHONE_PATTERN = "[0-9]{3}-[0-9]{3}-[0-9]{4}";
  static PLACEHOLDER_NOTES = "Add any notes you might have here. I like to keep track of gift ideas when I notice my daughter eyeballing something.";

  constructor(contactData) {
    if(contactData) {
      this.mount(contactData);  
    } 
    this.mountObjectives();
  };

  mount(contactData){
    Object.assign(this, contactData);
  }

  mountObjectives(objectivesData){
    let objectives = [];
    if(objectivesData && objectivesData.length) {
      objectivesData.forEach(objective =>{
        objectives.push(new Objective(objective))
      })
    } else if(this.objectives){
      this.objectives.forEach(objective => {
        objectives.push(new Objective(objective))
      })
    } 
    this.objectives = objectives;
  }

  getName(){
    return [this.first_name, this.last_name].join(' ').trim();
  }

  getFirstName(){
    return (this.first_name) ? this.first_name : "none";
  }

  getLastName(){
    return (this.last_name) ? this.last_name : "none";
  }

  getPreferredMedium(){
    return (this.preferred_medium) ? this.preferred_medium : "none";
  }

  getPhoneNumber(){
    return (this.phone_number) ? this.phone_number : 'none';
  }

  getEmail(){
    return (this.email) ? this.email : 'none';
  }

  getAddress(){
    let address = '';
    address += (this.street_address_1) ? this.street_address_1 : '';
    address += (this.street_address_2) ? `\n${this.street_address_2}` : '';
    address += (this.city && this.state_code && this.zip_code) ? 
      `\n${this.city}, ${this.state_code} ${this.zip_code}` : '';
    return (address) ? address : 'none';
  }

  countObjectives(){ 
    return (this.objectives) ? this.objectives.length : 0;
  }

  getInputFirstName(){
    return this.first_name;
  }

  getInputLastName(){
    return this.last_name;
  }

  getInputPreferredMedium(){
    return this.preferred_medium;
  }

  getInputPhoneNumber(){
    return this.phone_number;
  }

  getPhonePattern(){
    return Contact.PHONE_PATTERN;
  }

  getInputEmail(){
    return this.email;
  }

  getInputStreetAddress1(){
    return this.street_address_1;
  }

  getInputStreetAddress2(){
    return this.street_address_2;
  }

  getInputCity(){
    return this.city;
  }

  getInputState(){
    return this.state_code;
  }

  getInputZipcode(){
    return this.zip_code;
  }

  getInputCountry(){
    return this.country;
  }

  getInputNotes(){
    return this.notes;
  }

  getPlaceholderNotes(){
    return Contact.PLACEHOLDER_NOTES;
  }

  static makeContact(contactData, objectivesData){
    let contact = new Contact(contactData);
    contact.mountObjectives(objectivesData); 
    return contact;
  }
}


