CREATE TABLE users (
  id serial PRIMARY KEY,
  username varchar(100) text NOT NULL UNIQUE,
  email varchar(100) text NOT NULL UNIQUE,
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
  notes text
);

CREATE TABLE objectives (
  id serial PRIMARY KEY ,
  contact_id integer NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  occasion varchar(100),
  date_occasion date,
  periodicity text,
  date_next_contact date,
  date_last_contact date,
  reminder text,
  notes text
);