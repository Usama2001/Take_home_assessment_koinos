/**
 * Filter items based on search query
 * Searches in name, description, and category fields
 * @param {Array} items - Array of items to search
 * @param {string} query - Search query string
 * @returns {Array} Filtered items
 */
function filterItems(items, query) {
  if (!query || !query.trim()) {
    return items;
  }

  const searchTerm = query.toLowerCase().trim();
  
  return items.filter(item => {
    const name = (item.name || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    
    return name.includes(searchTerm) || 
           description.includes(searchTerm) || 
           category.includes(searchTerm);
  });
}

module.exports = {
  filterItems
};

