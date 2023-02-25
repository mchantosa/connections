// const ConnectionsDB = require('./lib/connections-db');
const ConnectionsDBAdmin = require('./lib/connections-admin');
// const Contact = require('./lib/contact');

const connectionsAdmin = new ConnectionsDBAdmin();
// const session = {};
// const connections = new ConnectionsDB(session);

module.exports = {
  deleteUserHandler: (app) => {
    app.delete(
      '/admin/user/:user_name/delete',
      async (req, res) => {
        const userName = req.params.user_name;
        const deleted = await connectionsAdmin.deleteUser(userName);
        res.send(`${deleted}`);
      },
    );
  },

  deleteAllContactsHandler: (app) => {
    app.delete(
      '/admin/user/:user_id/delete-all-contacts',
      async (req, res) => {
        const userId = +req.params.user_id;
        const user = await connectionsAdmin.getUser(userId);
        const deleted = await connectionsAdmin.deleteAllContactsFromUser(user.username);
        res.send(`${deleted}`);
      },
    );
  },

  // createContactHandler: (app) => {
  //   app.post(
  //     '/admin/user/:user_id/contacts/create-contact',
  //     async (req, res) => {
  //       const userId = +req.params.user_id;
  //       connections.user = await connectionsAdmin.getUser(userId);
  //       const contact = new Contact({
  //         user_id: userId,
  //         first_name: req.body.first_name,
  //         last_name: req.body.last_name,
  //         preferred_medium: req.body.preferred_medium,
  //         phone_number: req.body.phone_number,
  //         email: req.body.email,
  //         street_address_1: req.body.street_address_1,
  //         street_address_2: req.body.street_address_2,
  //         city: req.body.city,
  //         state_code: req.body.state_code,
  //         zip_code: req.body.zip_code,
  //         country: req.body.country,
  //         notes: req.body.notes,
  //       });
  //       const contactId = await connections.createContact(contact);
  //       res.json({ id: contactId });
  //     },
  //   );
  // },
};

// deleteAllContactsFromUser(username)
// deleteUser(username)
