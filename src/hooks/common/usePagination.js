import { useState, useMemo } from 'react';

export const usePagination = ({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1,
  maxPages = null
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calculate total pages
  const totalPages = useMemo(() => {
    const calculated = Math.ceil(totalItems / itemsPerPage);
    return maxPages ? Math.min(calculated, maxPages) : calculated;
  }, [totalItems, itemsPerPage, maxPages]);

  // Get current page data slice
  const getCurrentPageData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Navigation functions
  const goToPage = (page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);

  // Reset to first page when total items change
  const resetPagination = () => setCurrentPage(1);

  // Pagination info
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  return {
    // State
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    
    // Navigation
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    resetPagination,
    
    // Data helpers
    getCurrentPageData,
    
    // Info
    startItem,
    endItem,
    hasNext,
    hasPrevious,
    
    // Convenience booleans
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    isEmpty: totalItems === 0
  };
};
