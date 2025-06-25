/**
 * View Items functionality (Local Storage Version)
 * Displays and filters all lost and found items
 */

// DOM Elements
const itemsGrid = document.getElementById('items-grid');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');
const filterDate = document.getElementById('filter-date');
const tabButtons = document.querySelectorAll('.tab-btn');
const paginationContainer = document.getElementById('pagination');

// State variables
let allItems = { lostItems: [], foundItems: [] };
let filteredItems = [];
let currentTab = 'all';
let currentPage = 1;
const itemsPerPage = 9;

function initViewPage() {
  loadAllItems();

  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  filterType.addEventListener('change', applyFilters);
  filterCategory.addEventListener('change', applyFilters);
  filterDate.addEventListener('change', applyFilters);

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });
}

function loadAllItems() {
  itemsGrid.innerHTML = '<div class="loading">Loading items...</div>';

  allItems.lostItems = JSON.parse(localStorage.getItem('lostItems')) || [];
  allItems.foundItems = JSON.parse(localStorage.getItem('foundItems')) || [];

  processItems();
}

function processItems() {
  currentPage = 1;
  applyFilters();
}

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const typeFilter = filterType.value;
  const categoryFilter = filterCategory.value;
  const dateFilter = filterDate.value;

  let combinedItems = [
    ...allItems.lostItems.map(item => ({ ...item, type: 'lost' })),
    ...allItems.foundItems.map(item => ({ ...item, type: 'found' }))
  ];

  if (typeFilter !== 'all') combinedItems = combinedItems.filter(item => item.type === typeFilter);
  if (currentTab !== 'all') combinedItems = combinedItems.filter(item => item.type === currentTab);
  if (categoryFilter !== 'all') combinedItems = combinedItems.filter(item => item.category === categoryFilter);

  if (dateFilter !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);

    combinedItems = combinedItems.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      if (dateFilter === 'today') return itemDate >= today;
      if (dateFilter === 'week') return itemDate >= weekAgo;
      if (dateFilter === 'month') return itemDate >= monthAgo;
      return true;
    });
  }

  if (searchTerm) {
    combinedItems = combinedItems.filter(item =>
      (item.itemName && item.itemName.toLowerCase().includes(searchTerm)) ||
      (item.description && item.description.toLowerCase().includes(searchTerm)) ||
      (item.location && item.location.toLowerCase().includes(searchTerm)) ||
      (item.category && item.category.toLowerCase().includes(searchTerm))
    );
  }

  combinedItems.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  filteredItems = combinedItems;
  displayItems();
}

function handleSearch() {
  applyFilters();
}

function switchTab(tab) {
  currentTab = tab;
  tabButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tab) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  currentPage = 1;
  applyFilters();
}

function displayItems() {
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToShow = filteredItems.slice(startIndex, endIndex);

  if (filteredItems.length === 0) {
    itemsGrid.innerHTML = `
      <div class="empty-state">
        <h3>No Items Found</h3>
        <p>Try adjusting your filters or search criteria.</p>
      </div>
    `;
    paginationContainer.innerHTML = '';
    return;
  }

  itemsGrid.innerHTML = '';
  itemsToShow.forEach((item, index) => {
    const itemCard = createItemCard(item);
    itemCard.style.animationDelay = `${index * 0.1}s`;
    itemsGrid.appendChild(itemCard);
  });

  updatePagination(totalPages);
}

function createItemCard(item) {
  const itemCard = document.createElement('div');
  itemCard.className = `item-card ${item.type}`;

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
      <p class="item-description">${item.description}</p>
    </div>
    <div class="item-card-footer">
      <span>Posted by: ${item.userName}</span>
      <button class="btn btn-primary contact-btn" onclick="showContactInfo('${item.contact}')">Contact</button>
    </div>
  `;

  return itemCard;
}

function updatePagination(totalPages) {
  paginationContainer.innerHTML = '';
  if (totalPages <= 1) return;

  const prevButton = document.createElement('button');
  prevButton.innerHTML = '&laquo;';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  paginationContainer.appendChild(prevButton);

  const maxButtons = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.className = i === currentPage ? 'active' : '';
    pageButton.addEventListener('click', () => {
      currentPage = i;
      displayItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    paginationContainer.appendChild(pageButton);
  }

  const nextButton = document.createElement('button');
  nextButton.innerHTML = '&raquo;';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  paginationContainer.appendChild(nextButton);
}

window.showContactInfo = function(contact) {
  alert(`Contact Information: ${contact}`);
};

document.addEventListener('DOMContentLoaded', initViewPage);