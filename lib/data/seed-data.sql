INSERT INTO users (username, email, password_hash)
  VALUES ('admin@domain.com', 'admin@domain.com', '$2b$10$OHEtLiPamCGROXePpQFAYOxaaQrVbr3U0NECBrEBKOnklgLXaGwMW'), --adminPass
         ('developer@domain.com', 'developer@domain.com', '$2b$10$48.6hs6wndzW.ZFbKFUqhep1gLx/lmHgehH/WOXoJv3npsAdxU.vC'), --developerPass
         ('user@domain.com', 'user@domain.com', '$2b$10$amH8k0kGTCqNkRXTE8hxy.kqMQYgn4K5IfrfgDYsWhCUo.pVYmkVC'); --userPass

INSERT INTO contacts (user_id, first_name , last_name, 
  preferred_medium, phone_number, email,
  street_address_1, street_address_2, city, state_code, zip_code, country, 
  notes)
  VALUES (1, 'Zoe', NULL, 
    'slack', '123-456-7890', 'zoe@domain.com',
    '123 an exciting street', NULL, 'Seattle', 'WA', '98370', 'United States', 
    'She really wants a bird for Christmas'),
  (1, 'Riley', NULL,
    'Snapchat', '987-854-3210', 'riley@domain.com',
    '123 an exciting street', NULL, 'Seattle', 'WA', '98370', 'United States',
    NULL),
  (1, 'Ryan', NULL, 
     'phone', '975-310-8642', 'ryan@domain.com',
    NULL,NULL,NULL,NULL,NULL,NULL,
    'Get the Jakob and Ryan matching gifts'),
  (1, 'Oak', NULL, 
    'slack', NULL, 'oak@domain.com', 
    '123 an exciting street', NULL, 'South Riding', 'VA', '20152', 'United States',
    'A smurf TV tray'),
  (1, NULL, 'Noel', 
    'prayer', NULL, NULL, 
    NULL,NULL,NULL,NULL,NULL,NULL,
    NULL);

INSERT INTO objectives (contact_id, occasion, date_occasion, 
  periodicity, date_next_contact, date_last_contact, reminder)
  VALUES(1, 'Birthday', '2000-11-03', 'ANNUAL', NULL, NULL, 30),
  (1, 'Anniversary', '2008-10-03', 'ANNUAL', NULL, NULL, 30),
  (1, 'Christmas', '1100-12-25', 'ANNUAL', NULL, NULL, 30),
  (1, 'Valentine''s Day', '1100-02-14', 'ANNUAL', NULL, NULL, 14);



