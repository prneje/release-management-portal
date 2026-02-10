/**
 * Determines the appropriate API base URL based on the current hostname.
 * This allows the application to seamlessly switch between different environments
 * (local, dev, qa, prod) without requiring code changes.
 *
 * @returns {string} The API base URL for the current environment.
 */
const getApiBaseUrl = (): string => {
  const hostname = window.location.hostname;

  switch (hostname) {
    // Local development environment
    case 'localhost':
    case '127.0.0.1':
      return 'http://localhost:8080/api';

    // Example for a development environment hostname
    case 'dev.release-portal.com':
      return 'https://dev-api.release-portal.com/api';

    // Example for a QA environment hostname
    case 'qa.release-portal.com':
      return 'https://qa-api.release-portal.com/api';

    // Default case for production or any other unmatched hostname.
    // Assumes the frontend is served from the same domain as the backend.
    default:
      return '/api';
  }
};

// Export the dynamically determined API base URL for use throughout the application.
export const API_BASE_URL = getApiBaseUrl();
