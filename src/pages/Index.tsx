
import React from 'react';
import BlogHeader from '../components/BlogHeader';
import BlogContent from '../components/BlogContent';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

const Index = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-900" />
        
        {/* Content */}
        <div className="relative">
          <BlogHeader />
          <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
            <div className="max-w-7xl mx-auto">
              <PWAInstallPrompt />
              <BlogContent />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
