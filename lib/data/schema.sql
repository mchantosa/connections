CREATE TABLE users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  email_authenticated boolean NOT NULL DEFAULT FALSE,
  password_hash text NOT NULL,
  first_name varchar(20),
  last_name varchar(20)
);

CREATE TABLE addresses (
  id serial PRIMARY KEY,
  street_address_1 text NOT NULL,
  street_address_2 text,
  city text NOT NULL,
  state_code text NOT NULL, 
  zip_code text NOT NULL,
  country text NOT NULL
); 

CREATE TABLE contacts (
  id serial PRIMARY KEY,
  first_name varchar(25) NOT NULL,
  last_name varchar(25),
  birthday date,
  preferred_medium varchar(25),
  phone_number varchar(25),
  notes text,
  address_id integer REFERENCES addresses(id),
  user_id integer NOT NULL REFERENCES users(id)
); --manual periodic address cleanup

CREATE TABLE objectives (
  contact_id integer PRIMARY KEY REFERENCES contacts(id) ON DELETE CASCADE,
  periodicity text DEFAULT 'none',
  birthday boolean DEFAULT FALSE,
  valentines boolean DEFAULT FALSE,
  christmas boolean DEFAULT FALSE
);