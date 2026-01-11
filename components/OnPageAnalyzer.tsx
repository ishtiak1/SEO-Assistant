
import React, { useState, useCallback } from 'react';
import Button from './Button';
import { getSimulatedOnPageAnalysis } from '../services/geminiService';
import { OnPageAnalysisResult } from '../types';

interface OnPageAnalyzerProps {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const OnPageAnalyzer: React.FC<OnPageAnalyzerProps> = ({ setLoading, setError }) => {
  const [url, setUrl] = useState<string>('');
  const [pageContent, setPageContent] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<OnPageAnalysisResult | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a URL.');
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await getSimulatedOnPageAnalysis(url, pageContent);
      setAnalysisResult(result);
    } catch (err) {
      setError((err as Error).message);
      // If API key is an issue, we assume the user needs to select it.
      if ((err as Error).message.includes("API Key issue")) {
        try {
          // Assume the API key dialog exists and works outside the component's direct control.
          // This simulates the check and prompt as per Gemini API guidance.
          if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function' && typeof window.aistudio.openSelectKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
              await window.aistudio.openSelectKey();
              setError("Please select a valid API key in the dialog. Check ai.google.dev/gemini-api/docs/billing for billing information.");
            }
          }
        } catch (dialogError) {
          console.error("Error with API Key selection dialog:", dialogError);
          setError(`Failed to open API key selection. Error: ${(dialogError as Error).message}`);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [url, pageContent, setLoading, setError]);

  return (
    <div className="flex-grow container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">On-Page Analyzer</h2>
        <p className="text-gray-600 mb-6">
          Get simulated on-page SEO analysis and actionable suggestions for a given URL and its content.
          Providing content can help the AI give more specific advice.
        </p>
        <div className="mb-6">
          <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
            Page URL:
          </label>
          <input
            type="url"
            id="url-input"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
            placeholder="e.g., 'https://example.com/my-great-article'"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAnalyze();
              }
            }}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="content-textarea" className="block text-sm font-medium text-gray-700 mb-2">
            Optional: Page Content (paste a snippet for better analysis):
          </label>
          <textarea
            id="content-textarea"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 min-h-[150px]"
            placeholder="Paste your article text or key sections here..."
            value={pageContent}
            onChange={(e) => setPageContent(e.target.value)}
          ></textarea>
        </div>
        <Button onClick={handleAnalyze} className="w-full sm:w-auto">Analyze Page</Button>
      </div>

      {analysisResult && (
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Analysis Results for <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{url}</a></h3>
          
          <div className="mb-8">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Summary</h4>
            <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>
          </div>

          {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Suggestions for Improvement</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {analysisResult.groundingUrls && analysisResult.groundingUrls.length > 0 && (
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-4">Grounding Sources (via Google Search)</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {analysisResult.groundingUrls.map((chunk, index) => chunk.web && (
                  <li key={index}>
                    <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      {chunk.web.title || chunk.web.uri}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                These links indicate external sources the AI might have referenced to formulate its response.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OnPageAnalyzer;
