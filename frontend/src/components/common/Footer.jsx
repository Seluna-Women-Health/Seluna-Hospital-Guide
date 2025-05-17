import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">© 2023 Women's Health Navigator</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-purple-600 hover:text-purple-800">Privacy Policy</a>
            <a href="#" className="text-purple-600 hover:text-purple-800">Terms of Use</a>
            <a href="#" className="text-purple-600 hover:text-purple-800">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 