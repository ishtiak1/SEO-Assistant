
import React from 'react';
import { AppSection } from '../types';

interface HeaderProps {
  currentSection: AppSection;
  onSectionChange: (section: AppSection) => void;
}

const Header: React.FC<HeaderProps> = ({ currentSection, onSectionChange }) => {
  const navItemClass = (section: AppSection) => 
    `px-4 py-2 text-lg font-medium cursor-pointer transition-colors duration-200 
    ${currentSection === section 
      ? 'border-b-4 border-indigo-500 text-indigo-700' 
      : 'text-gray-600 hover:text-indigo-500 hover:border-indigo-300 border-b-4 border-transparent'
    }`;

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Gemini SEO Assistant</h1>
        <nav className="flex space-x-2 sm:space-x-4">
          <button 
            onClick={() => onSectionChange(AppSection.KEYWORD_EXPLORER)} 
            className={navItemClass(AppSection.KEYWORD_EXPLORER)}
          >
            Keyword Explorer
          </button>
          <button 
            onClick={() => onSectionChange(AppSection.ON_PAGE_ANALYZER)} 
            className={navItemClass(AppSection.ON_PAGE_ANALYZER)}
          >
            On-Page Analyzer
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
