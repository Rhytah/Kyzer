import React, { useState, useMemo } from 'react';
import { usePagination } from '../../hooks';
import Pagination from './Pagination';

// Mock data generator
const generateMockData = (count) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
    description: `This is the description for item ${index + 1}`,
    category: ['Category A', 'Category B', 'Category C'][index % 3],
    status: ['Active', 'Inactive', 'Pending'][index % 3]
  }));
};

const PaginationExample = () => {
  // Mock data
  const allData = useMemo(() => generateMockData(47), []);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Use pagination hook
  const pagination = usePagination({
    totalItems: allData.length,
    itemsPerPage,
    initialPage: 1
  });

  // Get current page data
  const currentPageData = pagination.getCurrentPageData(allData);

  const handlePageChange = (page) => {
    pagination.goToPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    pagination.resetPagination();
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Pagination System Example</h2>
        <p className="text-gray-600 mb-6">
          Demonstrating the usePagination hook with the Pagination component.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Items per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Total items: <span className="font-medium">{pagination.totalItems}</span></span>
            <span>Total pages: <span className="font-medium">{pagination.totalPages}</span></span>
            <span>Current page: <span className="font-medium">{pagination.currentPage}</span></span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPageData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'Inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            showInfo={true}
          />
        </div>
      </div>

      {/* Navigation Examples */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Navigation Methods</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={pagination.goToFirst}
            disabled={pagination.isFirstPage}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            First Page
          </button>
          <button
            onClick={pagination.goToPrevious}
            disabled={!pagination.hasPrevious}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={pagination.goToNext}
            disabled={!pagination.hasNext}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            onClick={pagination.goToLast}
            disabled={pagination.isLastPage}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Last Page
          </button>
          <button
            onClick={pagination.goToPage(5)}
            className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Go to Page 5
          </button>
        </div>
      </div>

      {/* Pagination State Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Current Pagination State:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Current Page:</span> {pagination.currentPage}
          </div>
          <div>
            <span className="font-medium">Total Pages:</span> {pagination.totalPages}
          </div>
          <div>
            <span className="font-medium">Items Per Page:</span> {pagination.itemsPerPage}
          </div>
          <div>
            <span className="font-medium">Total Items:</span> {pagination.totalItems}
          </div>
          <div>
            <span className="font-medium">Start Item:</span> {pagination.startItem}
          </div>
          <div>
            <span className="font-medium">End Item:</span> {pagination.endItem}
          </div>
          <div>
            <span className="font-medium">Has Next:</span> {pagination.hasNext ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Has Previous:</span> {pagination.hasPrevious ? 'Yes' : 'No'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginationExample;
