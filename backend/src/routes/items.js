const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { calculateStats, getCachedStats, invalidateCache } = require('../services/statsService');
const { filterItems } = require('../services/searchService');

const DATA_FILE = path.join(__dirname, '../../data/items.json');

// Cache for items data (in-memory cache)
let itemsCache = null;
let itemsCacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds

/**
 * Asynchronously reads and caches items data
 * Uses in-memory caching to avoid repeated file reads
 */
async function getItems() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (itemsCache && (now - itemsCacheTimestamp) < CACHE_TTL) {
    return itemsCache;
  }

  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    itemsCache = JSON.parse(data);
    itemsCacheTimestamp = now;
    return itemsCache;
  } catch (error) {
    console.error('Error reading items file:', error);
    throw new Error('Failed to read items data');
  }
}

/**
 * GET /api/items
 * Returns paginated list of items with optional search
 * Query params:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10)
 *   - q: search query to filter items
 */
router.get('/items', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, q = '' } = req.query;
    const items = await getItems();
    
    // Filter items if search query provided
    let filteredItems = items;
    if (q) {
      filteredItems = filterItems(items, q);
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    res.json({
      items: paginatedItems,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(filteredItems.length / limitNum),
        totalItems: filteredItems.length,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats
 * Returns statistics about items
 * Uses caching to avoid recalculating on every request
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getCachedStats(() => getItems());
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/items/:id
 * Returns a single item by ID
 */
router.get('/items/:id', async (req, res, next) => {
  try {
    const items = await getItems();
    const item = items.find(i => i.id === parseInt(req.params.id));
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

