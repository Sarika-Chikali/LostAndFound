/**
 * Local Storage Service for the Lost and Found application
 * Replaces API calls with localStorage operations
 */

// Utility function to get data from localStorage
function getStorageData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// Utility function to set data in localStorage
function setStorageData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Generate unique ID
function generateId(items) {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

/**
 * Get all lost items
 */
export async function getLostItems() {
  return getStorageData('lostItems');
}

/**
 * Get all found items
 */
export async function getFoundItems() {
  return getStorageData('foundItems');
}

/**
 * Get all items
 */
export async function getAllItems() {
  return {
    lostItems: await getLostItems(),
    foundItems: await getFoundItems()
  };
}

/**
 * Report a new lost item
 */
export async function reportLostItem(itemData) {
  const items = getStorageData('lostItems');
  const newItem = {
    ...itemData,
    id: generateId(items),
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  items.push(newItem);
  setStorageData('lostItems', items);
  return newItem;
}

/**
 * Report a new found item
 */
export async function reportFoundItem(itemData) {
  const items = getStorageData('foundItems');
  const newItem = {
    ...itemData,
    id: generateId(items),
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  items.push(newItem);
  setStorageData('foundItems', items);
  return newItem;
}

/**
 * Delete a lost item
 */
export async function deleteLostItem(id) {
  id = Number(id);  // Ensure numeric comparison
  const items = getStorageData('lostItems').filter(item => item.id !== id);
  setStorageData('lostItems', items);
}

/**
 * Delete a found item
 */
export async function deleteFoundItem(id) {
  id = Number(id);  // Ensure numeric comparison
  const items = getStorageData('foundItems').filter(item => item.id !== id);
  setStorageData('foundItems', items);
}

/**
 * Update a lost item
 */
export async function updateLostItem(id, itemData) {
  id = Number(id);
  let items = getStorageData('lostItems');
  items = items.map(item => item.id === id ? { ...item, ...itemData } : item);
  setStorageData('lostItems', items);
  return items.find(item => item.id === id);
}

/**
 * Update a found item
 */
export async function updateFoundItem(id, itemData) {
  id = Number(id);
  let items = getStorageData('foundItems');
  items = items.map(item => item.id === id ? { ...item, ...itemData } : item);
  setStorageData('foundItems', items);
  return items.find(item => item.id === id);
}

/**
 * Get user-specific items
 */
export async function getUserItems(userName) {
  const lostItems = getStorageData('lostItems').filter(item => item.userName === userName);
  const foundItems = getStorageData('foundItems').filter(item => item.userName === userName);
  return { lostItems, foundItems };
}

/**
 * Get recent items (sorted by createdAt)
 */
export async function getRecentItems(limit = 6) {
  const lostItems = getStorageData('lostItems').map(item => ({ ...item, type: 'lost' }));
  const foundItems = getStorageData('foundItems').map(item => ({ ...item, type: 'found' }));
  const allItems = [...lostItems, ...foundItems];

  allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return allItems.slice(0, limit);
}
