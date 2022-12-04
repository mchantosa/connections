CREATE TABLE users (
  user_email text PRIMARY KEY NOT NULL,
  user_password text NOT NULL
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
  first_name text NOT NULL,
  last_name text,
  birthday date,
  phone_number varchar(50),
  preffered_medium varchar(50),
  address_id integer REFERENCES addresses(id),
  user_email text NOT NULL REFERENCES users(user_email)
); --manual periodic address cleanup

CREATE TABLE objectives (
  contact_id integer PRIMARY KEY REFERENCES contacts(id) ON DELETE CASCADE,
  periodicity text DEFAULT 'none',
  birthday boolean DEFAULT FALSE,
  valentines boolean DEFAULT FALSE,
  christmas boolean DEFAULT FALSE
);