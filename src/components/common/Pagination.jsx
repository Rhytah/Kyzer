import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  totalItems = 0,
  itemsPerPage = 10,
  className = ''
}) => {
  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always include first page
    range.push(1);

    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Always include last page if more than 1 page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Add dots where there are gaps
    let l;
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Results info */}
      {showInfo && totalItems > 0 && (
        <div className="text-sm text-gray-600 order-2 sm:order-1">
          Showing <span className="font-medium text-gray-900">{startItem}</span> to{' '}
          <span className="font-medium text-gray-900">{endItem}</span> of{' '}
          <span className="font-medium text-gray-900">{totalItems}</span> results
        </div>
      )}

      {/* Pagination controls */}
      <nav className="order-1 sm:order-2" aria-label="Pagination">
        <ul className="flex items-center space-x-1">
          {/* Previous button */}
          <li>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
                flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg border transition-colors
                ${currentPage === 1
                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300'
                }
              `}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </li>

          {/* Page numbers */}
          <li className="hidden xs:block">
            <ul className="flex items-center space-x-1">
              {pageNumbers.map((pageNumber, index) => (
                <li key={index}>
                  {pageNumber === '...' ? (
                    <span className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-400">
                      <MoreHorizontal className="w-4 h-4" />
                    </span>
                  ) : (
                    <button
                      onClick={() => onPageChange(pageNumber)}
                      className={`
                        flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg border text-sm font-medium transition-colors
                        ${pageNumber === currentPage
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300'
                        }
                      `}
                      aria-label={`Page ${pageNumber}`}
                      aria-current={pageNumber === currentPage ? 'page' : undefined}
                    >
                      {pageNumber}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </li>

          {/* Mobile page info */}
          <li className="block xs:hidden">
            <span className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700">
              {currentPage} of {totalPages}
            </span>
          </li>

          {/* Next button */}
          <li>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
                flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg border transition-colors
                ${currentPage === totalPages
                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300'
                }
              `}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
