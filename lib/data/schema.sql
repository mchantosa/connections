CREATE TABLE users (
  id serial PRIMARY KEY,
  username varchar(100) NOT NULL UNIQUE,
  email varchar(100) NOT NULL UNIQUE,
  email_authenticated boolean NOT NULL DEFAULT FALSE,
  password_hash text NOT NULL,
  first_name varchar(25),
  last_name varchar(25)
);

CREATE TABLE contacts (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name varchar(25),
  last_name varchar(25),
  preferred_medium varchar(100),
  phone_number varchar(25),
  email varchar(100),
  street_address_1 varchar(100),
  street_address_2 varchar(100),
  city varchar(50),
  state_code varchar(50), 
  zip_code varchar(25),
  country varchar(25),
  last_connection date DEFAULT '1000-01-01' NOT NULL,
  notes text
);

CREATE TABLE objectives (
  id serial PRIMARY KEY ,
  contact_id integer NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  periodicity text NOT NULL CHECK (
    periodicity = 'Weekly'
    OR periodicity = 'Biweekly'
    OR periodicity = 'Monthly'
    OR periodicity = 'Quarterly'
  ),
  next_contact_date date NOT NULL,
  last_contact_date date,
  notes text
);