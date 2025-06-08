'use client';

import { useState } from 'react';

export default function TestAPIs() {
  const [geminiResult, setGeminiResult] = useState<string | null>(null);
  const [stabilityResult, setStabilityResult] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    gemini: false,
    stability: false
  });
  const [error, setError] = useState<string | null>(null);

  const testGeminiAPI = async () => {
    setLoading(prev => ({ ...prev, gemini: true }));
    setError(null);
    
    try {
      const response = await fetch('/api/gemini/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'Test API connection',
          count: 1
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGeminiResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(`Gemini API Error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Gemini API test failed:', err);
    } finally {
      setLoading(prev => ({ ...prev, gemini: false }));
    }
  };

  const testStabilityAPI = async () => {
    setLoading(prev => ({ ...prev, stability: true }));
    setError(null);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'A beautiful landscape',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStabilityResult(JSON.stringify({
        success: true,
        hasImageData: !!data.imageData,
        imageDataLength: data.imageData?.length || 0
      }, null, 2));
    } catch (err) {
      setError(`Stability API Error: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Stability API test failed:', err);
    } finally {
      setLoading(prev => ({ ...prev, stability: false }));
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">API Connection Tests</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Gemini API</h2>
          <button
            onClick={testGeminiAPI}
            disabled={loading.gemini}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading.gemini ? 'Testing...' : 'Test Gemini API'}
          </button>
          {geminiResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <pre className="text-sm overflow-auto">{geminiResult}</pre>
            </div>
          )}
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Stability AI API</h2>
          <button
            onClick={testStabilityAPI}
            disabled={loading.stability}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading.stability ? 'Testing...' : 'Test Stability AI API'}
          </button>
          {stabilityResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <pre className="text-sm overflow-auto">{stabilityResult}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
