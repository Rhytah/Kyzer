import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = '',
  size = 'default', // 'sm', 'default', 'lg'
  variant = 'default', // 'default', 'minimal', 'outlined'
  disabled = false,
  showPageInfo = false,
  showPageSize = false,
  pageSize = 5,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  totalItems = 0,
  ...props
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    if (showPageInfo) {
      return (
        <div className={`flex items-center justify-between text-sm text-gray-600 ${className}`}>
          <div>
            {totalItems > 0 && (
              <span>
                Showing {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination for large page counts
      const halfVisible = Math.floor(maxVisiblePages / 2);
      
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);
      
      // Adjust if we're near the beginning or end
      if (currentPage <= halfVisible) {
        endPage = Math.min(totalPages, maxVisiblePages);
      }
      if (currentPage >= totalPages - halfVisible) {
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
      }
      
      // Add pages with ellipsis logic
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('ellipsis-start');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('ellipsis-end');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  // Size classes
  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      info: 'text-xs'
    },
    default: {
      button: 'px-3 py-2 text-sm',
      icon: 'w-4 h-4',
      info: 'text-sm'
    },
    lg: {
      button: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      info: 'text-base'
    }
  };

  // Variant classes
  const variantClasses = {
    default: {
      button: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
      active: 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600',
      disabled: 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
    },
    minimal: {
      button: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
      active: 'text-blue-600 bg-blue-50 font-medium',
      disabled: 'text-gray-400 cursor-not-allowed'
    },
    outlined: {
      button: 'border border-gray-300 text-gray-700 hover:border-gray-400',
      active: 'border-blue-500 bg-blue-50 text-blue-600',
      disabled: 'border-gray-200 text-gray-400 cursor-not-allowed'
    }
  };

  const currentSize = sizeClasses[size];
  const currentVariant = variantClasses[variant];

  const renderPageButton = (page) => {
    const isActive = page === currentPage;
    const isDisabled = disabled;
    
    const baseClasses = `inline-flex items-center justify-center min-w-[2rem] rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${currentSize.button}`;
    
    let buttonClasses = `${baseClasses} ${currentVariant.button}`;
    
    if (isActive) {
      buttonClasses = `${baseClasses} ${currentVariant.active}`;
    } else if (isDisabled) {
      buttonClasses = `${baseClasses} ${currentVariant.disabled}`;
    }

    return (
      <button
        key={page}
        onClick={() => !isDisabled && onPageChange(page)}
        disabled={isDisabled}
        className={buttonClasses}
        aria-current={isActive ? 'page' : undefined}
        aria-label={`Go to page ${page}`}
      >
        {page}
      </button>
    );
  };

  const renderEllipsis = (key) => (
    <span
      key={key}
      className="inline-flex items-center justify-center min-w-[2rem] text-gray-400"
      aria-hidden="true"
    >
      <MoreHorizontal className={currentSize.icon} />
    </span>
  );

  const renderNavigationButton = (direction, page, label, icon) => {
    const isDisabled = disabled || page === currentPage || page < 1 || page > totalPages;
    
    const baseClasses = `inline-flex items-center justify-center min-w-[2rem] rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${currentSize.button}`;
    
    let buttonClasses = `${baseClasses} ${currentVariant.button}`;
    
    if (isDisabled) {
      buttonClasses = `${baseClasses} ${currentVariant.disabled}`;
    }

    return (
      <button
        onClick={() => !isDisabled && onPageChange(page)}
        disabled={isDisabled}
        className={buttonClasses}
        aria-label={label}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className={`flex items-center justify-between ${className}`} {...props}>
      {/* Page Info */}
      {showPageInfo && (
        <div className={`text-gray-600 ${currentSize.info}`}>
          {totalItems > 0 && (
            <span>
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
            </span>
          )}
        </div>
      )}

      {/* Page Size Selector */}
      {showPageSize && onPageSizeChange && (
        <div className="flex items-center space-x-2">
          <span className={`text-gray-600 ${currentSize.info}`}>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={disabled}
            className={`px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            }`}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* First Page */}
        {showFirstLast && currentPage > 1 && (
          renderNavigationButton(
            'first',
            1,
            'Go to first page',
            <span className={currentSize.icon}>1</span>
          )
        )}

        {/* Previous Page */}
        {showPrevNext && (
          renderNavigationButton(
            'prev',
            currentPage - 1,
            'Go to previous page',
            <ChevronLeft className={currentSize.icon} />
          )
        )}

        {/* Page Numbers */}
        {visiblePages.map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return renderEllipsis(page);
          }
          return renderPageButton(page);
        })}

        {/* Next Page */}
        {showPrevNext && (
          renderNavigationButton(
            'next',
            currentPage + 1,
            'Go to next page',
            <ChevronRight className={currentSize.icon} />
          )
        )}

        {/* Last Page */}
        {showFirstLast && currentPage < totalPages && (
          renderNavigationButton(
            'last',
            totalPages,
            'Go to last page',
            <span className={currentSize.icon}>{totalPages}</span>
          )
        )}
      </div>
    </div>
  );
};

export default Pagination;
