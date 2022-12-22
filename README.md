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
      - Open terminal to contact-manager-main/lib/data
      - Execute `./create-connections-db.sh`, this will delete any exiting connections database and create a new one.
      - Execute `./load-users.sh`, this will load profile information for an admin, developer, and user account
      - Execute `./load-contacts.sh`, this will load 100 contacts into your database
      - Execute `./load-objectives.sh`, this will load 1000 objectives into your database
  3. Install node modules
      - Navigate to contact-manager-main directory
      - Install node packages with `npm install`
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

## Takeaways and moving forward
I would love to completely redo the CSS for this. I initially was thinking I wanted something reminiscent of writing on a desk, something warm, like a coffee date between friends. Then I had to get fancy with opaque overlays in order to make the text pop from the background. Then I went even further and tried to make pop up windows for things like password resets thinking it looked fancy. But the pop up windows went over an opaque overlay that obscured access to the layer below which housed the data from the last page (think having a change your name popup menu over a profile page). This means to render the popup, you have to provide the information for the page below the transparent overlay as well as the top layer. Now you if you want to persist data over a failed validation thread and re-rendering in the top layer, I set that up using the same fields as the bottom layer. The result being, if you have a validation failure and rerender, in order to populate the top layer, you mutate the bottom layer. This gives the impression that your bad data was populated to the database (which it wasn't). I could fix it, but would rather do a redesign of that view, fixing it is not a good use of my time. The data is correct, but the appearance is misleading. It looks sloppy, and it is unnecessarily complicated.

I created unit tests for complicated things that were not functioning well. I should have established a more robust testing infrastructure sooner. When I linted, it broke a lot of stuff. I had to retest everything, and most of it was not automated. The Postman testing was also VERY helpful for quickly confirming validation. I could have saved time by setting that up sooner. Additionally, the linter removed my `use strict` statements, I didn't forget them. It appears that they are not necessary for my setup.  

I went back and forth initially with session tracking by username verses user id. I am not happy that is uses username, it makes the SQL calls unnecessarily cumbersome. 