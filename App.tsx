
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import KeywordExplorer from './components/KeywordExplorer';
import OnPageAnalyzer from './components/OnPageAnalyzer';
import { AppSection } from './types';

// Define the AIStudio interface explicitly to avoid type conflicts
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Extend the Window interface to include aistudio properties
declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.KEYWORD_EXPLORER);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);

  // Function to check and prompt for API key, designed to be called when an API call might fail
  const checkAndPromptForKey = useCallback(async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function' && typeof window.aistudio.openSelectKey === 'function') {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
        if (!hasKey) {
          setError(
            `Please select a valid API key for the Gemini API. 
            Certain models or tools (like 'googleSearch' used in On-Page Analyzer) 
            may require a paid API key. Click 'Select API Key' to proceed. 
            Refer to ai.google.dev/gemini-api/docs/billing for more information.`
          );
        } else {
          setError(null);
        }
      } catch (err) {
        console.error("Error checking API key status:", err);
        setError(`Failed to verify API key status: ${(err as Error).message}`);
      }
    } else {
      setError("AI Studio API Key selection tools are not available in this environment.");
    }
  }, []);

  useEffect(() => {
    // Initial check for API key when the app mounts
    checkAndPromptForKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleSelectApiKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      setLoading(true);
      setError(null);
      try {
        await window.aistudio.openSelectKey();
        // Assume success, UI will refresh or next API call will work
        setApiKeySelected(true); 
        setError(null); // Clear previous API key errors
      } catch (err) {
        console.error("Error opening API Key selection dialog:", err);
        setError(`Failed to open API key selection dialog: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    } else {
      setError("API Key selection not supported in this environment.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentSection={currentSection} onSectionChange={setCurrentSection} />
      <main className="flex-grow">
        {loading && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
              <p className="mt-4 text-white text-lg">Thinking...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="container mx-auto mt-4 px-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{error}</span>
              {window.aistudio && typeof window.aistudio.openSelectKey === 'function' && (
                <button
                  onClick={handleSelectApiKey}
                  className="mt-2 ml-0 sm:ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Select API Key
                </button>
              )}
            </div>
          </div>
        )}

        {currentSection === AppSection.KEYWORD_EXPLORER && (
          <KeywordExplorer setLoading={setLoading} setError={setError} />
        )}
        {currentSection === AppSection.ON_PAGE_ANALYZER && (
          <OnPageAnalyzer setLoading={setLoading} setError={setError} />
        )}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center text-sm sticky bottom-0">
        <p>&copy; {new Date().getFullYear()} Gemini SEO Assistant. All rights reserved. (Simulated functionality)</p>
      </footer>
    </div>
  );
};

export default App;