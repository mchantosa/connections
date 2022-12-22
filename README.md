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

- The version of node you used to run this application.
- The browser (including version number) that you used to test this application.
- The version of PostgreSQL you used to create any databases.
- How to install, configure, and run the application.
- Any additional details the grader may need to run your code.
- Keep in mind that your grader may be unfamiliar with the problem domain. If you think that's a possibility, you may wish to add a brief discussion of the vocabulary and concepts used in the application.
- Make sure the grader can start the application with the npm start command.

## For the grader
- In the top level of this file is a requirements matrix which maps requirements to my interpretation of their completion. In some cases there are some supportive tests, SQL statements, and database recommendations embedded in there.
- I didn't have a strong sense of ownership over the express + sql + pug + asynchronous calls + session management domain space going into this project. I spent the first week or so practicing and building confidence by setting up the infrastructure to support the /user content. 
  - You can log in with either an email or a username. Because you can authenticate with either an email or a username, I controlled for uniqueness across the union of the email and username data sets by preventing users from creating a username with an @ symbol. 
  - You can register for an account
  - You can change your password
  - You can change your email, username, and profile information
- While the connections page is incomplete, the contacts and objectives pages are sufficient to meet the requirements of this project.