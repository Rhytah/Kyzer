// src/components/editor/content-blocks/TableBlock.jsx
import { useEditor } from '@/hooks/editor';
import { Plus, Trash2 } from 'lucide-react';

const TableBlock = ({ data, isPreviewMode, block }) => {
  const { updateBlock } = useEditor();

  const handleHeaderChange = (index, value) => {
    const newHeaders = [...(data.headers || [])];
    newHeaders[index] = value;
    updateBlock(block.id, {
      data: { ...data, headers: newHeaders }
    });
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newRows = [...(data.rows || [])];
    newRows[rowIndex][colIndex] = value;
    updateBlock(block.id, {
      data: { ...data, rows: newRows }
    });
  };

  const handleAddRow = () => {
    const colCount = (data.headers || []).length;
    const newRow = Array(colCount).fill('');
    updateBlock(block.id, {
      data: { ...data, rows: [...(data.rows || []), newRow] }
    });
  };

  const handleRemoveRow = (rowIndex) => {
    const newRows = [...(data.rows || [])];
    newRows.splice(rowIndex, 1);
    updateBlock(block.id, {
      data: { ...data, rows: newRows }
    });
  };

  return (
    <div className="space-y-2 overflow-x-auto">
      <table className={`w-full ${data.bordered ? 'border border-gray-300' : ''}`}>
        <thead className="bg-gray-100">
          <tr>
            {(data.headers || []).map((header, index) => (
              <th key={index} className={`px-4 py-2 text-left ${data.bordered ? 'border border-gray-300' : ''}`}>
                {isPreviewMode ? (
                  <span className="font-semibold text-gray-900">{header}</span>
                ) : (
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => handleHeaderChange(index, e.target.value)}
                    className="w-full px-2 py-1 font-semibold border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                )}
              </th>
            ))}
            {!isPreviewMode && <th className="w-12"></th>}
          </tr>
        </thead>
        <tbody>
          {(data.rows || []).map((row, rowIndex) => (
            <tr key={rowIndex} className={data.striped && rowIndex % 2 === 0 ? 'bg-gray-50' : ''}>
              {row.map((cell, colIndex) => (
                <td key={colIndex} className={`px-4 py-2 ${data.bordered ? 'border border-gray-300' : ''}`}>
                  {isPreviewMode ? (
                    <span className="text-gray-800">{cell}</span>
                  ) : (
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  )}
                </td>
              ))}
              {!isPreviewMode && (
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => handleRemoveRow(rowIndex)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!isPreviewMode && (
        <button
          onClick={handleAddRow}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
      )}
    </div>
  );
};

export default TableBlock;

