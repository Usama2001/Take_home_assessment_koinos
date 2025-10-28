import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Items from '../Items';

// Mock the fetch API
global.fetch = jest.fn();

const mockItemsResponse = {
  items: [
    {
      id: 1,
      name: 'Test Item 1',
      description: 'Test description 1',
      price: 99.99,
      category: 'Test Category'
    },
    {
      id: 2,
      name: 'Test Item 2',
      description: 'Test description 2',
      price: 149.99,
      category: 'Test Category'
    }
  ],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 2,
    itemsPerPage: 20
  }
};

describe('Items Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should render loading state initially', async () => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockItemsResponse)
      })
    );

    render(<Items />);
    
    // Should show loading skeleton
    expect(screen.getByText(/Searching/)).toBeInTheDocument();
  });

  it('should fetch and display items', async () => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockItemsResponse)
      })
    );

    render(<Items />);

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });

    expect(screen.getByText(/Showing 2 of 2 items/)).toBeInTheDocument();
  });

  it('should handle search input changes', async () => {
    const searchResponse = {
      items: [mockItemsResponse.items[0]],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 20
      }
    };

    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItemsResponse)
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(searchResponse)
        })
      );

    render(<Items />);

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search items/);
    fireEvent.change(searchInput, { target: { value: 'Item 1' } });

    // Wait for debounce
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    }, { timeout: 1000 });
  });

  it('should handle API errors gracefully', async () => {
    fetch.mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<Items />);

    await waitFor(() => {
      expect(screen.getByText(/Error/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  it('should display pagination when there are multiple pages', async () => {
    const paginatedResponse = {
      items: [mockItemsResponse.items[0]],
      pagination: {
        currentPage: 1,
        totalPages: 3,
        totalItems: 45,
        itemsPerPage: 20
      }
    };

    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(paginatedResponse)
      })
    );

    render(<Items />);

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    });

    const nextButton = screen.getByLabelText(/Next page/);
    expect(nextButton).toBeInTheDocument();
  });
});

