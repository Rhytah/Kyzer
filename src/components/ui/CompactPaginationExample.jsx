import React, { useState } from 'react';
import CompactPagination from './CompactPagination';

const CompactPaginationExample = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const [currentPage3, setCurrentPage3] = useState(1);
  const [currentPage4, setCurrentPage4] = useState(1);

  const handlePageChange = (page, setter) => {
    setter(page);
    console.log('Page changed to:', page);
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Compact Pagination Component Examples</h2>
        <p className="text-gray-600 mb-6">
          Horizontal bar-style pagination similar to the reference design.
        </p>
      </div>

      {/* Default Variant */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Default Variant (Blue)</h3>
        <div className="bg-white p-6 rounded-lg border">
          <CompactPagination
            currentPage={currentPage}
            totalPages={10}
            onPageChange={(page) => handlePageChange(page, setCurrentPage)}
            variant="default"
          />
        </div>
      </div>

      {/* Pink Variant (like the image) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pink Variant (Like Reference Image)</h3>
        <div className="bg-white p-6 rounded-lg border">
          <CompactPagination
            currentPage={currentPage2}
            totalPages={2}
            onPageChange={(page) => handlePageChange(page, setCurrentPage2)}
            variant="pink"
          />
        </div>
      </div>

      {/* Green Variant */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Green Variant</h3>
        <div className="bg-white p-6 rounded-lg border">
          <CompactPagination
            currentPage={currentPage3}
            totalPages={5}
            onPageChange={(page) => handlePageChange(page, setCurrentPage3)}
            variant="green"
          />
        </div>
      </div>

      {/* Large Page Count */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Large Page Count (Smart Pagination)</h3>
        <div className="bg-white p-6 rounded-lg border">
          <CompactPagination
            currentPage={currentPage4}
            totalPages={25}
            onPageChange={(page) => handlePageChange(page, setCurrentPage4)}
            variant="blue"
          />
        </div>
      </div>

      {/* Without Page Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Without Page Info</h3>
        <div className="bg-white p-6 rounded-lg border">
          <CompactPagination
            currentPage={1}
            totalPages={8}
            onPageChange={(page) => handlePageChange(page, setCurrentPage)}
            variant="pink"
            showPageInfo={false}
          />
        </div>
      </div>

      {/* Disabled State */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Disabled State</h3>
        <div className="bg-white p-6 rounded-lg border">
          <CompactPagination
            currentPage={3}
            totalPages={7}
            onPageChange={(page) => handlePageChange(page, setCurrentPage)}
            variant="default"
            disabled={true}
          />
        </div>
      </div>

      {/* Single Page (Hidden) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Single Page (Hidden)</h3>
        <div className="bg-white p-6 rounded-lg border">
          <CompactPagination
            currentPage={1}
            totalPages={1}
            onPageChange={(page) => handlePageChange(page, setCurrentPage)}
            variant="default"
          />
          <p className="text-sm text-gray-500 mt-2">
            Component is hidden when there's only one page
          </p>
        </div>
      </div>

      {/* Current State Display */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Current State:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p>Default: Page <span className="font-mono bg-white px-2 py-1 rounded">{currentPage}</span></p>
            <p>Pink: Page <span className="font-mono bg-white px-2 py-1 rounded">{currentPage2}</span></p>
          </div>
          <div>
            <p>Green: Page <span className="font-mono bg-white px-2 py-1 rounded">{currentPage3}</span></p>
            <p>Blue: Page <span className="font-mono bg-white px-2 py-1 rounded">{currentPage4}</span></p>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold mb-2">Usage Examples:</h4>
        <div className="space-y-2 text-sm font-mono bg-white p-3 rounded">
          <div>// Basic usage</div>
          <div>&lt;CompactPagination</div>
          <div>&nbsp;&nbsp;currentPage={1}</div>
          <div>&nbsp;&nbsp;totalPages={10}</div>
          <div>&nbsp;&nbsp;onPageChange={(page) => setCurrentPage(page)}</div>
          <div>&nbsp;&nbsp;variant="pink"</div>
          <div>/&gt;</div>
        </div>
      </div>
    </div>
  );
};

export default CompactPaginationExample;
