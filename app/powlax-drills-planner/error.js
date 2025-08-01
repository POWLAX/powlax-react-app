'use client';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-4">{error.message || 'An unexpected error occurred'}</p>
        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-gray-500">Error details</summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
        <button
          onClick={() => reset()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}