import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import './Items.css';

/**
 * Items Component
 * Features:
 * - Memory leak fix using useEffect cleanup
 * - Pagination with server-side data
 * - Server-side search with debouncing
 * - Virtualization for performance with react-window
 * - Loading and skeleton states
 * - Responsive design
 */
const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Ref to track if component is mounted - prevents memory leak
  const isMountedRef = useRef(true);
  
  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      // Clear any pending debounce timers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Fetch items from the API
   * Uses abort controller to cancel pending requests if component unmounts
   */
  const fetchItems = useCallback(async (page = 1, search = '') => {
    // Create abort controller to cancel request if component unmounts
    const abortController = new AbortController();
    
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { q: search })
      });

      const response = await fetch(`/api/items?${params}`, {
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setItems(data.items);
        setPagination(data.pagination);
        setLoading(false);
        setIsSearching(false);
      }
    } catch (err) {
      // Don't update state if error is due to abort (component unmounted)
      if (err.name !== 'AbortError' && isMountedRef.current) {
        setError(err.message);
        setLoading(false);
        setIsSearching(false);
      }
    }

    return () => {
      abortController.abort();
    };
  }, []);

  // Fetch items on mount and when page changes
  useEffect(() => {
    if (!searchQuery) {
      fetchItems(currentPage, '');
    }
  }, [currentPage, fetchItems, searchQuery]);

  // Debounced search handler
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set up debounce
    if (searchQuery !== '') {
      setIsSearching(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchItems(1, searchQuery);
      }, 500); // 500ms debounce
    } else {
      setCurrentPage(1);
      fetchItems(1, '');
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, fetchItems]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Virtualized list row renderer
   * Optimizes rendering for large lists
   */
  const Row = useCallback(({ index, style }) => {
    const item = items[index];
    if (!item) return null;

    return (
      <div style={style}>
        <div className="item-card">
          <div className="item-header">
            <h3 className="item-name">{item.name}</h3>
            <span className="item-price">${item.price.toFixed(2)}</span>
          </div>
          <p className="item-description">{item.description}</p>
          <span className="item-category">{item.category}</span>
        </div>
      </div>
    );
  }, [items]);

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="item-card skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-price"></div>
      </div>
      <div className="skeleton-description"></div>
      <div className="skeleton-category"></div>
    </div>
  );

  // Error display
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => fetchItems(currentPage, searchQuery)} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="items-container">
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search items by name, description, or category..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Search items"
        />
        {isSearching && <div className="search-indicator">Searching...</div>}
      </div>

      {/* Stats Summary */}
      {pagination && (
        <div className="stats-summary">
          Showing {items.length} of {pagination.totalItems} items
        </div>
      )}

      {/* Items List */}
      <div className="items-list-container">
        {loading ? (
          // Skeleton loaders
          <div className="skeleton-container">
            {[...Array(5)].map((_, i) => (
              <SkeletonLoader key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          // No results
          <div className="no-results">
            <p>No items found{searchQuery ? ` matching "${searchQuery}"` : ''}</p>
          </div>
        ) : (
          // Virtualized list
          <FixedSizeList
            height={600}
            itemCount={items.length}
            itemSize={140}
            width="100%"
            className="virtualized-list"
          >
            {Row}
          </FixedSizeList>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
            aria-label="Previous page"
          >
            ← Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {pagination.totalPages}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="pagination-button"
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Items;

