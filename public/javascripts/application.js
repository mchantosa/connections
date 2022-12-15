"use strict";

//Listens for a form.delete or form.complete_all event and requests verification
document.addEventListener("DOMContentLoaded", function () {
  let forms = document.querySelectorAll("form.delete, form.complete_all");
  forms.forEach(form => {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (confirm("Are you sure? This cannot be undone!")) {
        event.target.submit();
      }
    });
  });
});
