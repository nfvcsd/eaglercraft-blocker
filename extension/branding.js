// Use plain text so school-provided messages cannot insert markup or scripts.
for (const element of document.querySelectorAll('[data-message]')) {
  element.textContent = chrome.i18n.getMessage(element.dataset.message);
}
