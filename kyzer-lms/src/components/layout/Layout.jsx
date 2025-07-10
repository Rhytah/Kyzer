export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Layout Test</h1>
        {children}
      </div>
    </div>
  );
}
