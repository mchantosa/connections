const Objective = require('./lib/objective');
const Contact = require('./lib/contact');

module.exports = {
  updatePeriodicObjective: (app, requiresAuthentication, requiresUserContactValidation) => {
    app.put(
      '/api/contacts/:contact_id/objectives/periodic/:objective_id',
      requiresAuthentication,
      requiresUserContactValidation,
      async (req, res) => {
        const contactId = +req.params.contact_id;
        const objectiveId = +req.params.objective_id;
        const objective = Objective.createEmptyObjective(req.body);
        objective.setId(objectiveId);
        const updated = await res.locals.store.updateObjective(objective);
        res.json({ updated });
      },
    );
  },
  snoozePeriodicObjective: (app, requiresAuthentication, requiresUserContactValidation) => {
    app.put(
      '/api/contacts/:contact_id/objectives/periodic/:objective_id/snooze',
      requiresAuthentication,
      requiresUserContactValidation,
      async (req, res) => {
        const contactId = +req.params.contact_id;
        const objectiveId = +req.params.objective_id;
        const nextContactDate = Objective.getSnoozeDate(req.body.next_contact_date);
        const objective = Objective.createEmptyObjective({
          id: objectiveId,
          next_contact_date: nextContactDate,
        });
        const updated = await res.locals.store.updateObjective(objective);
        res.json({ updated });
      },
    );
  },
  pullPeriodicObjective: (app, requiresAuthentication, requiresUserContactValidation) => {
    app.put(
      '/api/contacts/:contact_id/objectives/periodic/:objective_id/pull',
      requiresAuthentication,
      requiresUserContactValidation,
      async (req, res) => {
        const contactId = +req.params.contact_id;
        const objectiveId = +req.params.objective_id;
        const objective = Objective.createEmptyObjective({
          id: objectiveId,
          next_contact_date: Objective.getLastSunday(),
        });
        const updated = await res.locals.store.updateObjective(objective);
        res.json({ updated });
      },
    );
  },
  completePeriodicObjective: (app, requiresAuthentication, requiresUserContactValidation) => {
    app.put(
      '/api/contacts/:contact_id/objectives/periodic/:objective_id/complete',
      requiresAuthentication,
      requiresUserContactValidation,
      async (req, res) => {
        const contactId = +req.params.contact_id;
        const objectiveId = +req.params.objective_id;
        const objective = Objective.createEmptyObjective({
          id: objectiveId,
          last_contact_date: Objective.getMomentDate(),
          next_contact_date: Objective.getNextNextContactDate(req.body.period),
        });
        const updated = await res.locals.store.updateObjective(objective);
        res.json({ updated });
      },
    );
  },
  queryContacts: (app, requiresAuthentication) => {
    app.get(
      '/api/contacts/contacts-names',
      requiresAuthentication,
      async (req, res) => {
        const query = req.query.matching.toLowerCase() || '';
        const contactsNames = await res.locals.store.getContactsNames(query);
        res.json(contactsNames);
      },
    );
  },

  getContactId: (app, requiresAuthentication) => {
    app.get(
      '/api/contacts/get-contact-id',
      requiresAuthentication,
      async (req, res) => {
        const contactName = req.query.contact_name || '';
        const contactId = await res.locals.store.getContactId(contactName);
        if (!contactId)res.json({ id: contactId });
        else res.json(contactId);
      },
    );
  },

};
