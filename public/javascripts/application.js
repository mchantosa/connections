// Listens for a form.delete or form.complete_all event and requests verification
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form.delete');
  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (window.confirm('Are you sure? This cannot be undone!')) {
        event.target.submit();
      }
    });
  });
});
