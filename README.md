# Connections

## Domain space

### What this application does

This application is intended to help you stay connected to those you truly care about. This is designed to be a medium agnostic, non-calendered, warm and user friendly, communication asset, intended to support a small to medium set of contacts.

### How to set it up

1. Establish an account (SUPPORTING VIEWS COMPLETED)
2. Create contacts (SUPPORTING VIEWS COMPLETED)
3. Build contact communication objectives (SUPPORTING VIEWS COMPLETED)
4. Visit your home page with your morning/afternoon coffee (PLACEHOLDER VIEW)

### How to use it

(NOT YET COMPLETED) You will receive a weekly set of connection objectives that you can choose to complete or push to a future point in time. If you are familiar with a sprint cycle, you can think of it as setting up weekly sprints populated with communication tasks generated from your profile composition.

## Setup
- Pre-setup
  1. Make sure you have postgresql installed 
      - Make sure your postgresql service is running 
  2. Make sure you have node installed 
- How to install, configure, and run the application.
  1. Unzip
  2. Populate database
      - Navigate to contact-manager-main directory
      - Install node packages with `npm install`
      - Run `npm test`, this will execute test code and populate a database as part of the test set up
  3. Run server
      - Start server `npm start`, you should see a 'listening on port 3000 of localhost!' response in your terminal
  4. Go to application
      - In your browser go to localhost:3000/home, there will be some application information there and a link to a login page.
      - There are three accounts, admin, developer, and user.

        | username  |      email      |  password | seeded contacts |
        |----------|:----------------:|:---------:|----------------:|
        | admin     |  admin@domain.com     | adminPass | 100 |
        | developer | developer@domain.com  | developerPass | 0 |
        | user      | user@domain.com       | userPass | 0 |

## Test Environments
  - Node v17.0.1
  - Postgresql v14.6
  - This application was tested in Chrome (Version 108.0.5359.124)
  - This application was also tested with Postman (Version Version 9.31.23)
  - There are some unit tests, they can be run with npm test
  - For other environment details please refer to package.json 

## For the grader
- In the top level of this file is a requirements matrix which maps requirements to my interpretation of their completion. In some cases there are some supportive tests, SQL statements, and database recommendations embedded in there.
- I didn't have a strong sense of ownership over the express + sql + pug + asynchronous calls + session management domain space going into this project. I spent the first week or so practicing and building confidence by setting up the infrastructure to support the /user content. 
- You can log in with either an email or a username. Because you can authenticate with either an email or a username, I controlled for uniqueness across the union of the email and username data sets by preventing users from creating a username with an @ symbol. 
- You can register for an account
- You can change your password
- You can change your email, username, and profile information
- While the connections page is incomplete, the contacts and objectives pages are sufficient to meet the requirements of this project.
- Additional modifications requested from grader are tracked in the student-grader communication forum.

## Takeaways and moving forward
- Converted database from local postgres to supabase
- Configured DB authorization to .env
- Containerize app [using docker](#https://nodejs.org/en/docs/guides/nodejs-docker-webapp/#creating-a-dockerfile)

## Issues 
- user enters bad username or email causes application to crash
- Handler psql server crashing