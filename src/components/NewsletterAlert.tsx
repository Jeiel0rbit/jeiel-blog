
import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const NewsletterAlert = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Alert className="mb-3 bg-gradient-to-r from-gray-100/90 via-white/95 to-gray-100/90 dark:from-gray-800/90 dark:via-gray-900/95 dark:to-gray-800/90 border-gray-300/60 dark:border-gray-600/60 backdrop-blur-md shadow-lg py-2">
      <Mail className="h-4 w-4 text-gray-800 dark:text-gray-200" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <span className="text-sm text-gray-800 dark:text-gray-200">
            📬 Em breve <strong>Newsletter</strong> para receber estes conteúdos em seu e-mail.
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-300/70 dark:hover:bg-gray-600/70 rounded-full p-1"
          aria-label="Fechar notificação"
        >
          <X className="h-4 w-4" />
        </button>
      </AlertDescription>
    </Alert>
  );
};

export default NewsletterAlert;
