'use client';

import { useState } from 'react';

export default function SearchDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const chatbotId = '50ef4958-cbf5-4968-86a5-7da492ac99ce';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/chatbots/${chatbotId}/documents/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            topK: 3,
            chatbotId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search documents');
      }

      const data = await response.json();
      // Flatten and sort results by similarity
      const flattenedResults = Object.values(data.results || {})
        .flat()
        .sort((a: any, b: any) => b.similarity - a.similarity);
      setSearchResults(flattenedResults);
      setMessage('Search completed!');
    } catch (error) {
      setMessage('Error searching documents: ' + (error as Error).message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Document Search</h1>

      <div className="max-w-4xl mx-auto">
        {/* Search Form */}
        <div className="border p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSearch}>
            <div className="mb-4">
              <label className="block mb-2 text-lg font-medium">
                Search Query:
              </label>
              <textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 border rounded-lg text-lg min-h-[100px] resize-y"
                required
                placeholder="Enter your search query..."
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 text-lg font-medium"
            >
              Search
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">
                Results (sorted by relevance):
              </h3>
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="border p-4 rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Result #{index + 1}
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        Similarity: {(result.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-lg mb-2">{result.content}</p>
                    {result.metadata?.category && (
                      <p className="text-sm text-gray-600">
                        Category: {result.metadata.category}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">{message}</div>
        )}
      </div>
    </div>
  );
}
