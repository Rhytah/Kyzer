// src/components/editor/content-blocks/QuizBlock.jsx
import { ClipboardCheck } from 'lucide-react';

const QuizBlock = ({ data, isPreviewMode }) => {
  if (!data.quizId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg">
        <ClipboardCheck className="w-12 h-12 text-blue-400 mb-4" />
        <p className="text-blue-700 text-sm font-medium">No quiz selected</p>
        {!isPreviewMode && (
          <p className="text-blue-600 text-xs mt-2">
            Select this block and choose a quiz in the properties panel
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Quiz header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-semibold">{data.title || 'Quiz'}</h3>
            {data.passThreshold && (
              <p className="text-sm text-primary-100">
                Pass threshold: {data.passThreshold}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quiz content placeholder */}
      <div className="p-6 bg-white">
        {isPreviewMode ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Quiz will be displayed here during lesson playback
            </p>
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Start Quiz
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              Quiz ID: <span className="font-mono">{data.quizId}</span>
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Preview mode to see full quiz interface
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBlock;
