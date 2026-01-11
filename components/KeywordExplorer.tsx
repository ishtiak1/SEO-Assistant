
import React, { useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import Button from './Button';
import { getSimulatedKeywordAnalysis } from '../services/geminiService';
import { KeywordAnalysisResult } from '../types';

interface KeywordExplorerProps {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const KeywordExplorer: React.FC<KeywordExplorerProps> = ({ setLoading, setError }) => {
  const [keyword, setKeyword] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<KeywordAnalysisResult | null>(null);

  // Mock data for the chart. In a real scenario, this would come from a backend.
  const mockTrendData = [
    { name: 'Jan', volume: 400 },
    { name: 'Feb', volume: 300 },
    { name: 'Mar', volume: 500 },
    { name: 'Apr', volume: 450 },
    { name: 'May', volume: 600 },
    { name: 'Jun', volume: 700 },
  ];

  const handleAnalyze = useCallback(async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword.');
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await getSimulatedKeywordAnalysis(keyword);
      setAnalysisResult(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [keyword, setLoading, setError]);

  return (
    <div className="flex-grow container mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Keyword Explorer</h2>
        <p className="text-gray-600 mb-6">
          Enter a keyword to get simulated insights on search volume, difficulty, related keywords, and SERP analysis.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
            placeholder="e.g., 'best hiking trails near me'"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAnalyze();
              }
            }}
          />
          <Button onClick={handleAnalyze}>Analyze Keyword</Button>
        </div>
      </div>

      {analysisResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Keyword Insights</h3>
            <p className="mb-2"><span className="font-medium">Keyword:</span> {analysisResult.keyword}</p>
            <p className="mb-2"><span className="font-medium">Search Volume:</span> <span className={`font-bold ${analysisResult.searchVolume === 'High' ? 'text-green-600' : analysisResult.searchVolume === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>{analysisResult.searchVolume}</span></p>
            <p><span className="font-medium">Keyword Difficulty:</span> <span className={`font-bold ${analysisResult.keywordDifficulty === 'Easy' ? 'text-green-600' : analysisResult.keywordDifficulty === 'Medium' ? 'text-yellow-660' : 'text-red-600'}`}>{analysisResult.keywordDifficulty}</span></p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {analysisResult.relatedKeywords.map((related, index) => (
                <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  {related}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-2 lg:col-span-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">SERP Analysis</h3>
            <p className="text-gray-700 leading-relaxed">{analysisResult.serpAnalysis}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-2 lg:col-span-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Simulated Search Volume Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={mockTrendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#555">
                  <Label value="Month" offset={-3} position="insideBottom" />
                </XAxis>
                <YAxis stroke="#555">
                  <Label value="Volume" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                </YAxis>
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#ccc', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#333' }}
                  itemStyle={{ color: '#666' }}
                />
                <Bar dataKey="volume" fill="#8884d8" name="Search Volume" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500 mt-2 text-center">
              (This is a simulated trend for demonstration purposes.)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordExplorer;
