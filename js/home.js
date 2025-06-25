/**
 * Home page functionality (Static using LocalStorage)
 * Displays recent lost and found items
 */

// DOM Elements
const recentItemsContainer = document.getElementById('recent-items-container');

/**
 * Initialize the home page
 */
function initHomePage() {
  loadRecentItems();
}

/**
 * Load and display recent items from localStorage
 */
function loadRecentItems() {
  try {
    recentItemsContainer.innerHTML = '<div class="loading">Loading recent items...</div>';

    // Get data from localStorage
    const lostItems = JSON.parse(localStorage.getItem('lostItems')) || [];
    const foundItems = JSON.parse(localStorage.getItem('foundItems')) || [];

    // Combine and sort
    let recentItems = [...lostItems, ...foundItems];

    // Sort by date (newest first)
    recentItems.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    // Take the most recent 6 items
    recentItems = recentItems.slice(0, 6);

    // Display items or empty state
    if (recentItems.length === 0) {
      recentItemsContainer.innerHTML = `
        <div class="empty-state">
          <h3>No Items Yet</h3>
          <p>Be the first to report a lost or found item!</p>
          <div class="buttons">
            <a href="report-lost.html" class="btn btn-primary">Report Lost Item</a>
            <a href="report-found.html" class="btn btn-secondary">Report Found Item</a>
          </div>
        </div>
      `;
      return;
    }

    recentItemsContainer.innerHTML = '';

    // Create item cards
    recentItems.forEach((item, index) => {
      const itemCard = createItemCard(item);
      itemCard.style.animationDelay = `${index * 0.1}s`;
      recentItemsContainer.appendChild(itemCard);
    });
  } catch (error) {
    console.error('Error loading recent items:', error);
    recentItemsContainer.innerHTML = `
      <div class="error-state">
        <h3>Something went wrong</h3>
        <p>Failed to load recent items. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Create an item card element
 * @param {Object} item Item data
 * @returns {HTMLElement} Item card element
 */
function createItemCard(item) {
  const itemCard = document.createElement('div');
  itemCard.className = `item-card ${item.type} fade-in`;

  const itemDate = new Date(item.date || item.createdAt).toLocaleDateString();

  itemCard.innerHTML = `
    <div class="item-card-header">
      <h3>${item.itemName}</h3>
      <span class="item-type ${item.type}">${item.type === 'lost' ? 'Lost' : 'Found'}</span>
    </div>
    <div class="item-card-body">
      <div class="item-details">
        <div class="item-detail">
          <span class="item-detail-label">Category:</span>
          <span>${item.category || 'Not specified'}</span>
        </div>
        <div class="item-detail">
          <span class="item-detail-label">Location:</span>
          <span>${item.location || 'Not specified'}</span>
        </div>
        <div class="item-detail">
          <span class="item-detail-label">Date:</span>
          <span>${itemDate}</span>
        </div>
         ${item.type === 'found' && item.turnedIn !== undefined ? `
          <div class="item-detail">
            <span class="item-detail-label">Status:</span>
            <span>${item.turnedIn ? 'Turned in to Lost & Found Office' : 'Being held by finder'}</span>
          </div>` : ''}

      </div>
      <p class="item-description">${truncateText(item.description, 100)}</p>
    </div>
    <div class="item-card-footer">
      <span>Posted by: ${item.userName || 'Anonymous'}</span>
      <a href="view-items.html" class="btn btn-primary contact-btn">View Details</a>
    </div>
  `;

  return itemCard;
}

/**
 * Truncate text to a specified length
 * @param {string} text Text to truncate
 * @param {number} maxLength Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
}

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', initHomePage);
