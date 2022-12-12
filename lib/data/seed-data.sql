INSERT INTO users (username, email, password_hash)
  VALUES ('admin@domain.com', 'admin@domain.com', '$2b$10$OHEtLiPamCGROXePpQFAYOxaaQrVbr3U0NECBrEBKOnklgLXaGwMW'), --adminPass
         ('developer@domain.com', 'developer@domain.com', '$2b$10$48.6hs6wndzW.ZFbKFUqhep1gLx/lmHgehH/WOXoJv3npsAdxU.vC'), --developerPass
         ('user@domain.com', 'user@domain.com', '$2b$10$amH8k0kGTCqNkRXTE8hxy.kqMQYgn4K5IfrfgDYsWhCUo.pVYmkVC'); --userPass

INSERT INTO addresses (street_address_1, city, state_code, zip_code, country)
  VALUES ('123 an exciting street', 'Seattle', 'WA', '98370', 'United States'),
    ('123 an exciting street', 'South Riding', 'VA', '20152', 'United States');

INSERT INTO contacts (first_name, last_name, birthday, phone_number, preferred_medium, address_id, user_id)
  VALUES ('Zoe', NULL, '2014-05-05', '360-123-7890', 'Slack', 1, 1),
    ('Riley', NULL, '2008-02-22', '360-456-7890', 'Snapchat', 1, 1),
    ('Ryan', NULL, '2003-11-29', '360-789-0123', 'phone', 2, 1),
    ('Oak', NULL, '1975-06-19', '206-123-4444', 'email', NULL, 1),
    ('Noel', NULL, '2004-12-22', NULL, NULL, NULL, 1);

INSERT INTO objectives (contact_id) SELECT id FROM contacts;



