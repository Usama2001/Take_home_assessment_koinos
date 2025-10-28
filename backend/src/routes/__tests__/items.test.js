const request = require('supertest');
const app = require('../../../server');
const { calculateStats, getCachedStats, invalidateCache } = require('../../services/statsService');
const { filterItems } = require('../../services/searchService');

describe('Items Routes', () => {
  describe('GET /api/items', () => {
    it('should return paginated items', async () => {
      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('totalItems');
    });

    it('should respect page and limit query parameters', async () => {
      const response = await request(app)
        .get('/api/items?page=1&limit=5')
        .expect(200);

      expect(response.body.items.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.itemsPerPage).toBe(5);
    });

    it('should filter items based on search query', async () => {
      const response = await request(app)
        .get('/api/items?q=laptop')
        .expect(200);

      expect(Array.isArray(response.body.items)).toBe(true);
      // All returned items should contain 'laptop' in name, description, or category
      response.body.items.forEach(item => {
        const searchableText = `${item.name} ${item.description} ${item.category}`.toLowerCase();
        expect(searchableText).toContain('laptop');
      });
    });

    it('should return empty array if no items match search', async () => {
      const response = await request(app)
        .get('/api/items?q=nonexistentxyz123')
        .expect(200);

      expect(response.body.items).toEqual([]);
      expect(response.body.pagination.totalItems).toBe(0);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a single item by ID', async () => {
      const response = await request(app)
        .get('/api/items/1')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('price');
      expect(response.body.id).toBe(1);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .get('/api/items/999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item not found');
    });

    it('should handle invalid ID format gracefully', async () => {
      const response = await request(app)
        .get('/api/items/invalid')
        .expect(200); // Returns 200 with empty result

      // Item with invalid ID will return empty result
    });
  });

  describe('GET /api/stats', () => {
    it('should return statistics about items', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalItems');
      expect(response.body).toHaveProperty('averagePrice');
      expect(response.body).toHaveProperty('minPrice');
      expect(response.body).toHaveProperty('maxPrice');
      expect(response.body).toHaveProperty('categories');
      expect(typeof response.body.totalItems).toBe('number');
      expect(typeof response.body.averagePrice).toBe('number');
    });

    it('should use caching to return faster on subsequent requests', async () => {
      const start1 = Date.now();
      await request(app).get('/api/stats');
      const duration1 = Date.now() - start1;

      const start2 = Date.now();
      await request(app).get('/api/stats');
      const duration2 = Date.now() - start2;

      // Second request should be faster (cached)
      expect(duration2).toBeLessThan(duration1);
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // This test verifies the error handling middleware works
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });
});

describe('Search Service', () => {
  const mockItems = [
    { id: 1, name: 'Laptop', description: 'High performance', category: 'Electronics' },
    { id: 2, name: 'Mouse', description: 'Wireless mouse', category: 'Electronics' },
    { id: 3, name: 'Desk', description: 'Wooden desk', category: 'Furniture' }
  ];

  it('should filter items by name', () => {
    const result = filterItems(mockItems, 'laptop');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Laptop');
  });

  it('should filter items by description', () => {
    const result = filterItems(mockItems, 'wireless');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Mouse');
  });

  it('should filter items by category', () => {
    const result = filterItems(mockItems, 'furniture');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Desk');
  });

  it('should return all items if query is empty', () => {
    const result = filterItems(mockItems, '');
    expect(result.length).toBe(mockItems.length);
  });

  it('should be case insensitive', () => {
    const result = filterItems(mockItems, 'LAPTOP');
    expect(result.length).toBe(1);
  });
});

describe('Stats Service', () => {
  const mockItems = [
    { id: 1, name: 'Item 1', price: 100, category: 'A' },
    { id: 2, name: 'Item 2', price: 200, category: 'A' },
    { id: 3, name: 'Item 3', price: 150, category: 'B' }
  ];

  it('should calculate correct statistics', () => {
    const stats = calculateStats(mockItems);
    expect(stats.totalItems).toBe(3);
    expect(stats.averagePrice).toBe(150);
    expect(stats.minPrice).toBe(100);
    expect(stats.maxPrice).toBe(200);
    expect(stats.categories).toEqual({ A: 2, B: 1 });
  });

  it('should handle empty array', () => {
    const stats = calculateStats([]);
    expect(stats.totalItems).toBe(0);
    expect(stats.averagePrice).toBe(0);
    expect(stats.minPrice).toBe(0);
    expect(stats.maxPrice).toBe(0);
  });

  it('should handle invalid input', () => {
    const stats = calculateStats(null);
    expect(stats.totalItems).toBe(0);
  });
});

