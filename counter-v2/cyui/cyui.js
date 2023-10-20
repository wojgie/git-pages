function val(id) {
    return document.getElementById(id).value;
}

function valCheckbox(id) {
    return document.getElementById(id).checked;
}

function setText(id, val) {
    document.getElementById(id).innerText = val;
}

function get(id) {
    return document.getElementById(id);
}

function isIterable(obj) {
    // checks for null and undefined
    if (obj == null) {
      return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
  }
  