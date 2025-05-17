import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { useAppContext } from '../../contexts/AppContext';

const Header = () => {
  const { session } = useAppContext();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-purple-600">
          Women's Health Navigator
        </Link>
        
        <div className="flex items-center gap-4">
          <LanguageSelector />
          
          {session.isLoggedIn ? (
            <button className="text-purple-600 hover:text-purple-800">
              My Account
            </button>
          ) : (
            <button className="text-purple-600 hover:text-purple-800">
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 