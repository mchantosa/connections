document.addEventListener('DOMContentLoaded', () => {
  console.log('...loaded');

  const snoozes = document.querySelectorAll('.snooze');
  const completeds = document.querySelectorAll('.completed');
  const pulls = document.querySelectorAll('.pull');
  const getSnoozeObjectivePath = (contactId, objectiveId) => `/api/contacts/${contactId}/objectives/periodic/${objectiveId}/snooze`;
  const getCompleteObjectivePath = (contactId, objectiveId) => `/api/contacts/${contactId}/objectives/periodic/${objectiveId}/complete`;
  const getPullObjectivePath = (contactId, objectiveId) => `/api/contacts/${contactId}/objectives/periodic/${objectiveId}/pull`;

  snoozes.forEach((snooze) => {
    snooze.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const contactId = snooze.getAttribute('data-contact-id');
      const objectiveId = snooze.getAttribute('data-objective-id');
      const nextContactDate = snooze.getAttribute('data-objective-next-contact-date');
      console.log('hello');
      console.log(nextContactDate);
      const path = getSnoozeObjectivePath(contactId, objectiveId);
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      if (nextContactDate) {
        options.body = new URLSearchParams({ next_contact_date: nextContactDate });
      }
      fetch(path, options).then((response) => {
        if (response.status === 200) window.location.reload();
        else alert('Failed to snooze objective');
      });
    });
  });

  completeds.forEach((completed) => {
    completed.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const contactId = completed.getAttribute('data-contact-id');
      const objectiveId = completed.getAttribute('data-objective-id');
      const period = completed.getAttribute('data-objective-periodicity');
      const path = getCompleteObjectivePath(contactId, objectiveId);
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          period,
        }),
      };
      fetch(path, options).then((response) => {
        if (response.status === 200) window.location.reload();
        else alert('Failed to complete objective');
      });
    });
  });

  pulls.forEach((pull) => {
    pull.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const contactId = pull.getAttribute('data-contact-id');
      const objectiveId = pull.getAttribute('data-objective-id');
      const path = getPullObjectivePath(contactId, objectiveId);
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      fetch(path, options).then((response) => {
        if (response.status === 200) window.location.reload();
        else alert('Failed to pull objective');
      });
    });
  });
});
