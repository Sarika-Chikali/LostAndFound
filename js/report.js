/**
 * Report functionality (Static using LocalStorage)
 * Handles reporting lost and found items
 */

// Determine the page type
const isLostPage = window.location.pathname.includes('report-lost.html');
const isFoundPage = window.location.pathname.includes('report-found.html');

// Get the form element
const lostItemForm = document.getElementById('lost-item-form');
const foundItemForm = document.getElementById('found-item-form');

/**
 * Initialize the report page
 */
function initReportPage() {
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => input.value = today);

  if (lostItemForm) {
    lostItemForm.addEventListener('submit', handleLostItemSubmit);
    const userNameInput = document.getElementById('userName');
    if (userNameInput) userNameInput.value = localStorage.getItem('userName') || '';
  }

  if (foundItemForm) {
    foundItemForm.addEventListener('submit', handleFoundItemSubmit);
    const userNameInput = document.getElementById('userName');
    if (userNameInput) userNameInput.value = localStorage.getItem('userName') || '';
  }
}

/**
 * Handle lost item form submission
 */
function handleLostItemSubmit(event) {
  event.preventDefault();

  const submitButton = lostItemForm.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Submitting...';
  submitButton.disabled = true;

  try {
    const formData = new FormData(lostItemForm);
    const lostItemData = Object.fromEntries(formData.entries());

    // Add extra data
    lostItemData.type = 'lost';
    lostItemData.createdAt = new Date().toISOString();
    lostItemData.id = Date.now(); // unique ID

    // Save user name
    localStorage.setItem('userName', lostItemData.userName);

    // Save to localStorage
    const lostItems = JSON.parse(localStorage.getItem('lostItems')) || [];
    lostItems.push(lostItemData);
    localStorage.setItem('lostItems', JSON.stringify(lostItems));

    showMessage('Your lost item has been reported successfully!', 'success', lostItemForm);
    lostItemForm.reset();
    restoreUserInfoAndDate(lostItemForm, lostItemData.userName);

  } catch (error) {
    console.error('Error:', error);
    showMessage(`Failed to report lost item: ${error.message}`, 'error', lostItemForm);
  } finally {
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

/**
 * Handle found item form submission
 */
function handleFoundItemSubmit(event) {
  event.preventDefault();

  const submitButton = foundItemForm.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Submitting...';
  submitButton.disabled = true;

  try {
    const formData = new FormData(foundItemForm);
    const foundItemData = Object.fromEntries(formData.entries());

    foundItemData.type = 'found';
    foundItemData.createdAt = new Date().toISOString();
    foundItemData.id = Date.now();
    foundItemData.turnedIn = foundItemData.turnedIn === 'true';

    localStorage.setItem('userName', foundItemData.userName);

    const foundItems = JSON.parse(localStorage.getItem('foundItems')) || [];
    foundItems.push(foundItemData);
    localStorage.setItem('foundItems', JSON.stringify(foundItems));

    showMessage('Your found item has been reported successfully!', 'success', foundItemForm);
    foundItemForm.reset();
    restoreUserInfoAndDate(foundItemForm, foundItemData.userName);

  } catch (error) {
    console.error('Error:', error);
    showMessage(`Failed to report found item: ${error.message}`, 'error', foundItemForm);
  } finally {
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

/**
 * Show a message above the form
 */
function showMessage(message, type, form) {
  const div = document.createElement('div');
  div.className = type === 'success' ? 'success-message' : 'error-message';
  div.textContent = message;
  form.parentNode.insertBefore(div, form);
  setTimeout(() => div.remove(), 5000);
}

/**
 * Restore userName and date after form reset
 */
function restoreUserInfoAndDate(form, userName) {
  const userNameInput = form.querySelector('#userName');
  const dateInput = form.querySelector('#date');
  if (userNameInput) userNameInput.value = userName;
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
}

// Init page on load
document.addEventListener('DOMContentLoaded', initReportPage);
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-type]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const userName = localStorage.getItem('userName') || prompt("Enter your name:");
      if (!userName) return;

      const itemName = form.querySelector('[name="itemName"]').value.trim();
      const category = form.querySelector('[name="category"]').value.trim();
      const location = form.querySelector('[name="location"]').value.trim();
      const date = form.querySelector('[name="date"]').value;
      const description = form.querySelector('[name="description"]').value.trim();

      const itemType = form.getAttribute('data-type');

      const newItem = {
        id: crypto.randomUUID(),
        username: userName,
        itemName,
        category,
        location,
        date,
        description,
        type: itemType,
        createdAt: new Date().toISOString(),
        turnedIn: itemType === 'found' ? false : undefined
      };

      const allItems = JSON.parse(localStorage.getItem('items')) || [];
      allItems.push(newItem);
      localStorage.setItem('items', JSON.stringify(allItems));

      alert(`${itemType === 'lost' ? 'Lost' : 'Found'} item reported successfully!`);
      window.location.href = "dashboard.html";
    });
  });
});
