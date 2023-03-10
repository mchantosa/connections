import debounce from './debounce.js';
/*
  -INVOCATION:
    -identify element you wish to autocomplete (example: #autocomplete-contact)
    -identify corresponding api path supplying query results (example: /api/contacts/contact-name)
    -create a corresponding event handler:
      new Autocomplete('/api/contacts/contact-name', '#autocomplete-contact');
  -ACCESSIBILITY: Add this file to your header as a module
    - script(type="module" src="/javascripts/autocomplete.js")
  -API: Configure API to support this event handler
    - return format [{name: elementName, id: elementId},...]
  -REMOVE UNNECESSARY: This code was configured to carefully overlay a transparent suggestion.
    That doesn't work out unless you match to the start. If matching anywhere,
    you need to disable the overlay, the tab can stay.
    You can also remove .autocomplete-overlay CSS.
  -CSS suggestion(below):
    - Will need to add a font correction
    - .autocomplete-overlay {top and left} will need to be tailored to your font style and size.
    - .autocomplete-wrapper {
        position: relative;
      }

      .autocomplete-wrapper input {
        position: relative;
        z-index: 10;
        background: transparent;
      }

      .autocomplete-ui {
        list-style: none;
        padding: 0px;
        margin-top: 0;
        width: 200px;
        box-shadow: 0 1px 2px grey;
      }

      .autocomplete-ui-choice {
        padding: 5px;
        border-bottom: solid 1px #ddd;
      }

      .autocomplete-ui-choice:hover {
        background: #eee;
        cursor: pointer;
      }

      .autocomplete-ui-choice.selected {
        background: lightblue;
      }

      .autocomplete-ui-choice:last-of-type {
        border-bottom: 0;
      }

      .autocomplete-overlay {
        position: absolute;
        top: .2em;
        left: .2em;
        z-index: 1;
        color: #999;
        white-space: nowrap;
        overflow: hidden;
      }

      .autocomplete-overlay:empty {
        display: none;
      }

*/

class Autocomplete {
  constructor(url, elementIdentifier) {
    console.log('Hello world, you are in autocomplete');
    this.input = document.querySelector(elementIdentifier);
    this.input.placeholder = 'Find a contact';
    this.url = `${url}?matching=`;

    this.listUI = null;
    // this.overlay = null;

    this.visible = false;
    this.matches = [];

    this.wrapInput();
    this.createUI();

    this.valueChanged = debounce(this.valueChanged.bind(this), 300);

    this.bindEvents();
    this.reset();
  }

  // create ui
  wrapInput() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('autocomplete-wrapper');
    this.input.parentNode.appendChild(wrapper);
    wrapper.appendChild(this.input);
  }

  createUI() {
    const listUI = document.createElement('ul');
    listUI.classList.add('autocomplete-ui');
    this.input.parentNode.appendChild(listUI);
    this.listUI = listUI;

    // const overlay = document.createElement('div');
    // overlay.classList.add('autocomplete-overlay');
    // overlay.style.width = `${this.input.clientWidth}px`;

    // this.input.parentNode.appendChild(overlay);
    // this.overlay = overlay;
  }

  // fill process UI
  bindEvents() {
    this.input.addEventListener('input', this.valueChanged);
    this.input.addEventListener('keydown', this.handleKeydown.bind(this));
    this.listUI.addEventListener('mousedown', this.handleMousedown.bind(this));
  }

  valueChanged() {
    const { value } = this.input;
    this.previousValue = value;

    if (value.length > 0) {
      this.fetchMatches(value, (matches) => {
        this.visible = true;
        this.matches = matches;
        this.bestMatchIndex = 0;
        this.selectedIndex = null;
        this.draw();
      });
    } else {
      this.reset();
    }
  }

  // get data to fill ui
  fetchMatches(query, callback) {
    const request = new XMLHttpRequest();

    request.addEventListener('load', () => {
      callback(request.response);
    });

    request.open('GET', `${this.url}${encodeURIComponent(query)}`);
    request.responseType = 'json';
    request.send();
  }

  // render ui
  draw() {
    while (this.listUI.lastChild) {
      this.listUI.removeChild(this.listUI.lastChild);
    }

    // if (!this.visible) {
    //   this.overlay.textContent = '';
    //   return;
    // }

    // if (this.bestMatchIndex !== null && this.matches.length !== 0) {
    //   const selected = this.matches[this.bestMatchIndex];
    //   this.overlay.textContent = this.generateOverlayContent(this.input.value, selected);
    // } else {
    //   this.overlay.textContent = '';
    // }

    this.matches.forEach((match, index) => {
      const li = document.createElement('li');
      li.classList.add('autocomplete-ui-choice');

      if (index === this.selectedIndex) {
        li.classList.add('selected');
        this.input.value = match.name;
      }

      li.textContent = match.name;
      this.listUI.appendChild(li);
    });
  }

  // transparent suggestion
  // eslint-disable-next-line class-methods-use-this
  // generateOverlayContent(value, match) {
  //   console.log(`value: ${value}`);
  //   console.log(`match: ${match}`);
  //   const end = match.name.substr(value.length);
  //   return value + end;
  // }

  // reset ui
  reset() {
    this.visible = false;
    this.matches = [];
    this.bestMatchIndex = null;
    this.selectedIndex = null;
    this.previousValue = null;

    this.draw();
  }

  // Manipulating the list
  handleKeydown(event) {
    // eslint-disable-next-line default-case
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.selectedIndex === null || this.selectedIndex === this.matches.length - 1) {
          this.selectedIndex = 0;
        } else {
          this.selectedIndex += 1;
        }
        this.bestMatchIndex = null;
        this.draw();
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.selectedIndex === null || this.selectedIndex === 0) {
          this.selectedIndex = this.matches.length - 1;
        } else {
          this.selectedIndex -= 1;
        }
        this.bestMatchIndex = null;
        this.draw();
        break;
      case 'Tab':
        if (this.bestMatchIndex !== null && this.matches.length !== 0) {
          this.input.value = this.matches[this.bestMatchIndex].name;
          event.preventDefault();
        }
        this.reset();
        break;
      case 'Enter':
        console.log(`matches: ${this.matches}`);
        console.log(`selectedIndex: ${this.selectedIndex}`);
        if (this.selectedIndex)window.location.href = `/user/contacts/${this.matches[this.selectedIndex].id}`;
        else {
          let id = null;
          this.matches.forEach((match) => {
            if (this.input.value.toLowerCase() === match.name.toLowerCase()) id = match.id;
          });
          if (id) {
            window.location.href = `/user/contacts/${id}`;
          } else {
            // fetch contactId
            const options = {
              method: 'GET',
            };
            fetch(`/api/contacts/get-contact-id?contact_name=${this.input.value}`, options)
              .then((response) => response.json())
              .then((data) => {
                if (data.id) window.location.href = `/user/contacts/${data.id}`;
                else alert(`We don't have a contact for you that matches "${this.input.value}"`);
              });
          }
        }
        break;
      case 'Escape': // escape
        this.input.value = this.previousValue;
        this.reset();
        break;
    }
  }

  handleMousedown(event) {
    const element = event.target;
    this.input.value = element.textContent;
    this.reset();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('...loaded');

  // eslint-disable-next-line no-new
  new Autocomplete('/api/contacts/contacts-names', '#autocomplete-contact');
});
