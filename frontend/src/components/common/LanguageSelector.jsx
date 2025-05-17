import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

const LanguageSelector = () => {
  const { language, setLanguage } = useAppContext();
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'es', name: 'Español' }
  ];

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="py-1 px-2 rounded border border-gray-300"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector; 