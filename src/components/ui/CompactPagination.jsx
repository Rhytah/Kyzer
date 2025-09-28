import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const CompactPagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  disabled = false,
  showPageInfo = true,
  variant = 'default', // 'default', 'pink', 'blue', 'green'
  ...props
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1 && !disabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !disabled) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (!disabled && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Variant styles
  const variantStyles = {
    default: {
      active: 'bg-blue-500 text-white',
      inactive: 'bg-blue-500 text-white opacity-60',
      next: 'bg-white text-blue-500 border border-blue-500',
      text: 'text-gray-600'
    },
    pink: {
      active: 'bg-pink-500 text-white',
      inactive: 'bg-pink-500 text-white opacity-60',
      next: 'bg-white text-pink-500 border border-pink-500',
      text: 'text-gray-600'
    },
    blue: {
      active: 'bg-blue-600 text-white',
      inactive: 'bg-blue-600 text-white opacity-60',
      next: 'bg-white text-blue-600 border border-blue-600',
      text: 'text-gray-600'
    },
    green: {
      active: 'bg-green-500 text-white',
      inactive: 'bg-green-500 text-white opacity-60',
      next: 'bg-white text-green-500 border border-green-500',
      text: 'text-gray-600'
    }
  };

  const styles = variantStyles[variant];

  // Generate page buttons (show max 3 pages + next button)
  const getPageButtons = () => {
    const buttons = [];
    const maxVisible = 3;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            disabled={disabled}
            className={`
              flex items-center justify-center min-w-[2rem] h-8 px-2 font-semibold text-sm
              transition-all duration-200
              ${i === currentPage ? styles.active : styles.inactive}
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}
              ${i === 1 ? 'rounded-l-md' : ''}
              ${i === totalPages ? 'rounded-r-md' : ''}
            `}
          >
            {i}
          </button>
        );
      }
    } else {
      // Smart pagination for larger page counts
      const showEllipsis = totalPages > maxVisible + 1;
      
      if (currentPage <= 2) {
        // Show first 3 pages
        for (let i = 1; i <= Math.min(3, totalPages); i++) {
          buttons.push(
            <button
              key={i}
              onClick={() => handlePageClick(i)}
              disabled={disabled}
              className={`
                flex items-center justify-center min-w-[2rem] h-8 px-2 font-semibold text-sm
                transition-all duration-200
                ${i === currentPage ? styles.active : styles.inactive}
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}
                ${i === 1 ? 'rounded-l-md' : ''}
              `}
            >
              {i}
            </button>
          );
        }
      } else if (currentPage >= totalPages - 1) {
        // Show last 3 pages
        for (let i = Math.max(1, totalPages - 2); i <= totalPages; i++) {
          buttons.push(
            <button
              key={i}
              onClick={() => handlePageClick(i)}
              disabled={disabled}
              className={`
                flex items-center justify-center min-w-[2rem] h-8 px-2 font-semibold text-sm
                transition-all duration-200
                ${i === currentPage ? styles.active : styles.inactive}
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}
                ${i === totalPages ? 'rounded-r-md' : ''}
              `}
            >
              {i}
            </button>
          );
        }
      } else {
        // Show current page and adjacent pages
        buttons.push(
          <button
            key={1}
            onClick={() => handlePageClick(1)}
            disabled={disabled}
            className={`
              flex items-center justify-center min-w-[2rem] h-8 px-2 font-semibold text-sm
              transition-all duration-200
              ${styles.inactive}
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}
              rounded-l-md
            `}
          >
            1
          </button>
        );

        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          if (i > 1 && i < totalPages) {
            buttons.push(
              <button
                key={i}
                onClick={() => handlePageClick(i)}
                disabled={disabled}
                className={`
                  flex items-center justify-center min-w-[2rem] h-8 px-2 font-semibold text-sm
                  transition-all duration-200
                  ${i === currentPage ? styles.active : styles.inactive}
                  ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}
                `}
              >
                {i}
              </button>
            );
          }
        }

        buttons.push(
          <button
            key={totalPages}
            onClick={() => handlePageClick(totalPages)}
            disabled={disabled}
            className={`
              flex items-center justify-center min-w-[2rem] h-8 px-2 font-semibold text-sm
              transition-all duration-200
              ${styles.inactive}
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}
              rounded-r-md
            `}
          >
            {totalPages}
          </button>
        );
      }
    }

    return buttons;
  };

  return (
    <div className={`flex items-center gap-4 ${className}`} {...props}>
      {/* Pagination Controls */}
      <div className="flex items-center">
        {getPageButtons()}
        
        {/* Next Button */}
        {currentPage < totalPages && (
          <button
            onClick={handleNext}
            disabled={disabled}
            className={`
              flex items-center justify-center h-8 px-3 font-semibold text-sm
              transition-all duration-200
              ${styles.next}
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}
              rounded-r-md ml-1
            `}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Page Info */}
      {showPageInfo && (
        <div className={`text-sm font-medium ${styles.text}`}>
          PAGE {currentPage} OF {totalPages}
        </div>
      )}
    </div>
  );
};

export default CompactPagination;
