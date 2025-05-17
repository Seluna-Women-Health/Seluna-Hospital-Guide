import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
            Women's Health Symptom Navigator
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-700">
            Understand your symptoms with clarity and compassion
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                to="/symptom-checker" 
                className="block w-64 py-4 px-6 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-2">🔍</span>
                  <span>Start Symptom Check</span>
                </div>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 md:mt-0"
            >
              <Link 
                to="/hospital-simulation" 
                className="block w-64 py-4 px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-2">🏥</span>
                  <span>Hospital Visit Guide</span>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Features Section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-purple-50">
            <div className="bg-purple-100 h-16 w-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🔊</span>
            </div>
            <h3 className="text-xl font-bold text-center mb-3 text-purple-800">Voice-Enabled</h3>
            <p className="text-gray-600 text-center">Describe your symptoms naturally with our voice recognition technology.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-purple-50">
            <div className="bg-pink-100 h-16 w-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="text-xl font-bold text-center mb-3 text-purple-800">Culturally Sensitive</h3>
            <p className="text-gray-600 text-center">Understand your symptoms through different cultural perspectives.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-purple-50">
            <div className="bg-purple-100 h-16 w-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-center mb-3 text-purple-800">Private & Secure</h3>
            <p className="text-gray-600 text-center">Your health information stays private and secure with our platform.</p>
          </div>
        </motion.div>
        
        {/* Testimonial */}
        <motion.div 
          className="max-w-4xl mx-auto mt-20 p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-6 md:mb-0 md:mr-8 flex-shrink-0">
              {/* Placeholder for user avatar */}
            </div>
            
            <div>
              <p className="text-lg italic mb-4">"This tool helped me understand my symptoms and gave me the confidence to discuss them with my doctor. I felt prepared and listened to during my visit."</p>
              <p className="font-bold text-purple-800">— Sarah T.</p>
            </div>
          </div>
        </motion.div>
        
        {/* Login CTA */}
        <div className="text-center mt-16">
          <motion.button 
            className="text-purple-600 hover:text-purple-800 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login to save your report
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 