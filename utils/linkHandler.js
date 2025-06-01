/**
 * Utility functions for handling Medium links and converting them to Freedium format
 */

/**
 * Check if a URL is a valid Medium article link
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL is a valid Medium article link
 */
export const isMediumLink = (url) => {
  if (!url) return false;
  
  // Match medium.com or any subdomain of medium.com
  // Also match custom domains that host Medium content like blog.example.com
  // const mediumRegex = /^https:\/\/medium\.com(\/|$)/i;
  const mediumRegex = /^https?:\/\/(([a-z0-9-]+\.)?medium\.com\/|[a-z0-9-]+\.[a-z0-9-]+\/)/i;
  
  return mediumRegex.test(url);
};

/**
 * Convert a Medium URL to Freedium format
 * @param {string} url - The Medium URL to convert
 * @returns {string} - The converted Freedium URL
 */
export const convertToFreedium = (url) => {
  if (!url) return '';
  
  // Remove any trailing slashes
  const cleanUrl = url.replace(/\/$/, '');
  
  // Create the Freedium URL
  return `https://freedium.cfd/${cleanUrl}`;
};

/**
 * Extract the article title from a Medium URL
 * @param {string} url - The Medium URL
 * @returns {string} - The extracted title or a default title
 */
export const extractArticleTitle = (url) => {
  if (!url) return 'Article';
  
  try {
    // Try to extract the last part of the URL path which often contains the title
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length > 0) {
      // Convert dash-separated title to readable format
      const lastPart = pathParts[pathParts.length - 1];
      return lastPart
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return 'Medium Article';
  } catch (error) {
    return 'Medium Article';
  }
};
