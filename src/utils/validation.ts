
// Input validation utilities for security
export const validateSlug = (slug: string): boolean => {
  // Allow only alphanumeric characters, hyphens, and underscores
  const slugRegex = /^[a-zA-Z0-9\-_]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 200;
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters
  return input.replace(/[<>'"&]/g, '');
};

export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};
