CREATE TABLE users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  email_authenticated boolean NOT NULL DEFAULT FALSE,
  password_hash text NOT NULL,
  first_name varchar(20),
  last_name varchar(20)
);

CREATE TABLE contacts (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name varchar(25),
  last_name varchar(25),
  preferred_medium varchar(25),
  phone_number varchar(25),
  email varchar(25),
  street_address_1 text,
  street_address_2 text,
  city text,
  state_code text, 
  zip_code text,
  country text,
  notes text
);

CREATE TABLE objectives (
  id serial PRIMARY KEY ,
  contact_id integer NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  occasion varchar(25),
  date_occasion date,
  periodicity text,
  date_next_contact date,
  date_last_contact date,
  reminder text
);