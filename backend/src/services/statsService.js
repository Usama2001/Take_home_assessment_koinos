const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/items.json');

// In-memory cache for stats
let statsCache = null;
let statsCacheTimestamp = 0;
let cacheTimeout = null;

const CACHE_TTL = 60000; // 60 seconds

// File watcher to invalidate cache when data changes
let watcher = null;

/**
 * Initialize file watcher to invalidate cache on file changes
 */
function initFileWatcher() {
  if (watcher) {
    watcher.close();
  }

  watcher = fs.watch(DATA_FILE, { persistent: false }, (eventType) => {
    if (eventType === 'change') {
      console.log('Data file changed, invalidating cache...');
      invalidateCache();
    }
  });
}

/**
 * Calculate statistics from items array
 */
function calculateStats(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      totalItems: 0,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      categories: {}
    };
  }

  const prices = items
    .map(item => parseFloat(item.price))
    .filter(price => !isNaN(price));
  
  const categories = {};
  items.forEach(item => {
    const category = item.category || 'uncategorized';
    categories[category] = (categories[category] || 0) + 1;
  });

  return {
    totalItems: items.length,
    averagePrice: prices.length > 0 
      ? parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2))
      : 0,
    minPrice: prices.length > 0 ? Math.min(...prices) : 0,
    maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    categories
  };
}

/**
 * Get cached stats or calculate and cache new stats
 */
async function getCachedStats(getItemsFn) {
  const now = Date.now();
  
  // Return cached stats if still valid
  if (statsCache && (now - statsCacheTimestamp) < CACHE_TTL) {
    return statsCache;
  }

  // Calculate new stats
  const items = await getItemsFn();
  statsCache = calculateStats(items);
  statsCacheTimestamp = now;

  // Initialize file watcher on first cache
  if (!watcher) {
    initFileWatcher();
  }

  // Set timeout to invalidate cache
  if (cacheTimeout) {
    clearTimeout(cacheTimeout);
  }
  cacheTimeout = setTimeout(() => {
    statsCache = null;
    statsCacheTimestamp = 0;
  }, CACHE_TTL);

  return statsCache;
}

/**
 * Invalidate the stats cache
 */
function invalidateCache() {
  statsCache = null;
  statsCacheTimestamp = 0;
  if (cacheTimeout) {
    clearTimeout(cacheTimeout);
    cacheTimeout = null;
  }
}

module.exports = {
  calculateStats,
  getCachedStats,
  invalidateCache
};

