// Minimal test component to verify editor route works
import { useParams } from 'react-router-dom';

export default function CourseEditorTest() {
  const { courseId } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Course Editor Route Works! ✅</h1>
        <p className="text-xl mb-2">Course ID: {courseId}</p>
        <p className="text-gray-400">If you see this, the route is working correctly.</p>
      </div>
    </div>
  );
}
