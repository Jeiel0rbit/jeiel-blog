
// Security monitoring and validation utilities

// CSP violation reporting
export const reportCSPViolation = (violationReport: any) => {
  console.warn('CSP Violation:', violationReport);
  
  // In production, you might want to send this to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to monitoring service
    // fetch('/api/csp-violations', {
    //   method: 'POST',
    //   body: JSON.stringify(violationReport)
    // });
  }
};

// Security headers validation
export const validateSecurityHeaders = (response: Response): boolean => {
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection'
  ];
  
  return requiredHeaders.every(header => 
    response.headers.has(header)
  );
};

// Input sanitization
export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Rate limiting feedback
export const getRateLimitMessage = (remainingRequests: number): string => {
  if (remainingRequests <= 0) {
    return 'Rate limit exceeded. Please wait before making more requests.';
  }
  if (remainingRequests <= 2) {
    return `Only ${remainingRequests} requests remaining in this time window.`;
  }
  return '';
};

// Error message sanitization
export const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Don't expose sensitive information in error messages
    const safeMessage = error.message.replace(/token|key|password|secret/gi, '[REDACTED]');
    return safeMessage;
  }
  return 'An unexpected error occurred';
};

// Initialize CSP violation listener
export const initializeSecurityMonitoring = () => {
  // Listen for CSP violations
  document.addEventListener('securitypolicyviolation', (event) => {
    reportCSPViolation({
      blockedURI: event.blockedURI,
      disposition: event.disposition,
      documentURI: event.documentURI,
      effectiveDirective: event.effectiveDirective,
      originalPolicy: event.originalPolicy,
      referrer: event.referrer,
      statusCode: event.statusCode,
      violatedDirective: event.violatedDirective
    });
  });
  
  console.log('Security monitoring initialized');
};
