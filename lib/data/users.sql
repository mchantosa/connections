INSERT INTO users (username, email, password_hash)
  VALUES ('admin', 'admin@domain.com', '$2b$10$OHEtLiPamCGROXePpQFAYOxaaQrVbr3U0NECBrEBKOnklgLXaGwMW'), --adminPass
         ('developer', 'developer@domain.com', '$2b$10$48.6hs6wndzW.ZFbKFUqhep1gLx/lmHgehH/WOXoJv3npsAdxU.vC'), --developerPass
         ('user', 'user@domain.com', '$2b$10$amH8k0kGTCqNkRXTE8hxy.kqMQYgn4K5IfrfgDYsWhCUo.pVYmkVC'); --userPass



INSERT INTO authors (first_name, last_name)
  VALUES ('JRR', 'Tolkien'),
         ('Stephen', 'King'), 
         ('Ali', 'Wong');

INSERT INTO books (author_id, name)
  VALUES (1, 'The Hobbit'),
         (1, 'The Fellowship OTR'), 
         (1, 'The Silmarillian'),
         (2, 'The Shining'),
         (2, 'Carrie'),
         (2, 'Fairytale'),
         (3, 'Letters to my Daughters');

SELECT * FROM authors INNER JOIN books ON authors.id = books.author_id ORDER BY authors.last_name, books.name;
SELECT authors.last_name, authors.first_name, count(*) FROM authors INNER JOIN books ON authors.id = books.author_id GROUP BY authors.id ORDER BY authors.last_name;

SELECT * FROM authors WHERE ...;
SELECT * FROM books WHERE author_id IN (1, 2, 3);