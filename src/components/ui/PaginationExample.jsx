import React, { useState } from 'react';
import Pagination from './Pagination';

const PaginationExample = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 247; // Example total items
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    console.log('Page changed to:', page);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    console.log('Page size changed to:', newPageSize);
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Pagination Component Examples</h2>
        <p className="text-gray-600 mb-6">
          Different variants and configurations of the pagination component.
        </p>
      </div>

      {/* Default Pagination */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Default Pagination</h3>
        <div className="bg-white p-4 rounded-lg border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPageInfo={true}
            showPageSize={true}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            totalItems={totalItems}
          />
        </div>
      </div>

      {/* Minimal Variant */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Minimal Variant</h3>
        <div className="bg-white p-4 rounded-lg border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            variant="minimal"
            showPageInfo={true}
          />
        </div>
      </div>

      {/* Outlined Variant */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Outlined Variant</h3>
        <div className="bg-white p-4 rounded-lg border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            variant="outlined"
            showPageInfo={true}
          />
        </div>
      </div>

      {/* Small Size */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Small Size</h3>
        <div className="bg-white p-4 rounded-lg border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            size="sm"
            showPageInfo={true}
          />
        </div>
      </div>

      {/* Large Size */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Large Size</h3>
        <div className="bg-white p-4 rounded-lg border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            size="lg"
            showPageInfo={true}
          />
        </div>
      </div>

      {/* Without First/Last Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Without First/Last Buttons</h3>
        <div className="bg-white p-4 rounded-lg border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showFirstLast={false}
            showPageInfo={true}
          />
        </div>
      </div>

      {/* Without Previous/Next Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Without Previous/Next Buttons</h3>
        <div className="bg-white p-4 rounded-lg border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPrevNext={false}
            showPageInfo={true}
          />
        </div>
      </div>

      {/* Custom Max Visible Pages */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Max Visible Pages (3)</h3>
        <div className="bg-white p-4 rounded-lg border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            maxVisiblePages={3}
            showPageInfo={true}
          />
        </div>
      </div>

      {/* Disabled State */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Disabled State</h3>
        <div className="bg-white p-4 rounded-lg border">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            disabled={true}
            showPageInfo={true}
          />
        </div>
      </div>

      {/* Single Page (Hidden) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Single Page (Hidden)</h3>
        <div className="bg-white p-4 rounded-lg border">
          <Pagination
            currentPage={1}
            totalPages={1}
            onPageChange={handlePageChange}
            showPageInfo={true}
            totalItems={5}
          />
        </div>
      </div>

      {/* Current Page Display */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Current State:</h4>
        <p>Current Page: <span className="font-mono bg-white px-2 py-1 rounded">{currentPage}</span></p>
        <p>Page Size: <span className="font-mono bg-white px-2 py-1 rounded">{pageSize}</span></p>
        <p>Total Pages: <span className="font-mono bg-white px-2 py-1 rounded">{totalPages}</span></p>
        <p>Total Items: <span className="font-mono bg-white px-2 py-1 rounded">{totalItems}</span></p>
      </div>
    </div>
  );
};

export default PaginationExample;
