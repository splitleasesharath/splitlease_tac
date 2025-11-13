/**
 * URL Parameter Management Utilities
 * Handles serialization/deserialization of filter state to/from URL parameters
 * Enables shareable search URLs and browser navigation support
 *
 * Usage:
 *   import { parseUrlToFilters, updateUrlParams, serializeFiltersToUrl } from './urlParams.js';
 *
 *   // On component mount
 *   const filtersFromUrl = parseUrlToFilters();
 *
 *   // When filters change
 *   updateUrlParams(filters);
 */

import { DEFAULTS } from './constants.js';
import { sanitizeUrlParam } from './sanitize.js';

/**
 * Parse URL query parameters into filter state object
 * @returns {object} Filter state object
 */
export function parseUrlToFilters() {
  if (typeof window === 'undefined') {
    return getDefaultFilters();
  }

  const params = new URLSearchParams(window.location.search);

  return {
    selectedDays: parseDaysParam(params.get('days-selected')),
    selectedBorough: sanitizeUrlParam(params.get('borough'), 'string') || DEFAULTS.DEFAULT_BOROUGH,
    weekPattern: sanitizeUrlParam(params.get('weekly-frequency'), 'string') || DEFAULTS.DEFAULT_WEEK_PATTERN,
    priceTier: sanitizeUrlParam(params.get('pricetier'), 'string') || DEFAULTS.DEFAULT_PRICE_TIER,
    sortBy: sanitizeUrlParam(params.get('sort'), 'string') || DEFAULTS.DEFAULT_SORT_BY,
    selectedNeighborhoods: parseNeighborhoodsParam(params.get('neighborhoods'))
  };
}

/**
 * Parse days parameter from URL
 * Format: "1,2,3,4,5" (comma-separated day indices using 0-based indexing)
 * 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
 *
 * @param {string|null} daysParam - The days parameter from URL
 * @returns {Array<number>} Array of day indices (0-6)
 *
 * Examples:
 *   - "1,2,3,4,5" → [1, 2, 3, 4, 5] (Monday-Friday)
 *   - "0,6" → [0, 6] (Sunday and Saturday)
 *   - "5,6,0,1" → [5, 6, 0, 1] (Friday-Monday wrap-around)
 *   - "" or null → [1, 2, 3, 4, 5] (default to Monday-Friday)
 *   - "invalid" → [1, 2, 3, 4, 5] (fallback to default with warning)
 */
function parseDaysParam(daysParam) {
  if (!daysParam || daysParam.trim() === '') {
    return DEFAULTS.DEFAULT_SELECTED_DAYS;
  }

  try {
    const originalValues = daysParam.split(',').map(d => d.trim());
    const invalidValues = [];

    const days = originalValues
      .map(d => {
        const parsed = parseInt(d, 10);
        if (isNaN(parsed) || parsed < 0 || parsed > 6) {
          invalidValues.push(d);
          return null;
        }
        return parsed;
      })
      .filter(d => d !== null);

    // Warn about invalid values in development
    if (invalidValues.length > 0 && import.meta.env.DEV) {
      console.warn(
        `Invalid day indices in URL parameter 'days-selected': ${invalidValues.join(', ')}. ` +
        `Valid values are 0-6 (0=Sunday, 6=Saturday). Invalid values were ignored.`
      );
    }

    // If no valid days found, fall back to default
    if (days.length === 0) {
      if (import.meta.env.DEV) {
        console.warn(
          `No valid days found in URL parameter 'days-selected=${daysParam}'. ` +
          `Using default: Monday-Friday (1,2,3,4,5).`
        );
      }
      return DEFAULTS.DEFAULT_SELECTED_DAYS;
    }

    return days;
  } catch (error) {
    console.error('Failed to parse days parameter:', error);
    return DEFAULTS.DEFAULT_SELECTED_DAYS;
  }
}

/**
 * Parse neighborhoods parameter from URL
 * Format: "id1,id2,id3" (comma-separated neighborhood IDs)
 * @param {string|null} neighborhoodsParam - The neighborhoods parameter from URL
 * @returns {Array<string>} Array of neighborhood IDs
 */
function parseNeighborhoodsParam(neighborhoodsParam) {
  if (!neighborhoodsParam) {
    return [];
  }

  try {
    const neighborhoods = neighborhoodsParam
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    return neighborhoods;
  } catch (error) {
    console.error('Failed to parse neighborhoods parameter:', error);
    return [];
  }
}

/**
 * Serialize filter state to URL query string
 * @param {object} filters - Filter state object
 * @returns {string} URL query string (without leading ?)
 */
export function serializeFiltersToUrl(filters) {
  const params = new URLSearchParams();

  // Add days-selected parameter (always include, even if default)
  // This allows sharing URLs with complete filter state
  if (filters.selectedDays && filters.selectedDays.length > 0) {
    params.set('days-selected', filters.selectedDays.join(','));
  }

  // Add borough parameter (only if not default)
  if (filters.selectedBorough && filters.selectedBorough !== DEFAULTS.DEFAULT_BOROUGH) {
    params.set('borough', filters.selectedBorough);
  }

  // Add week pattern parameter (only if not default)
  if (filters.weekPattern && filters.weekPattern !== DEFAULTS.DEFAULT_WEEK_PATTERN) {
    params.set('weekly-frequency', filters.weekPattern);
  }

  // Add price tier parameter (only if not default)
  if (filters.priceTier && filters.priceTier !== DEFAULTS.DEFAULT_PRICE_TIER) {
    params.set('pricetier', filters.priceTier);
  }

  // Add sort parameter (only if not default)
  if (filters.sortBy && filters.sortBy !== DEFAULTS.DEFAULT_SORT_BY) {
    params.set('sort', filters.sortBy);
  }

  // Add neighborhoods parameter (only if not empty)
  if (filters.selectedNeighborhoods && filters.selectedNeighborhoods.length > 0) {
    params.set('neighborhoods', filters.selectedNeighborhoods.join(','));
  }

  return params.toString();
}

/**
 * Update browser URL without page reload
 * Uses History API to maintain browser navigation
 * @param {object} filters - Filter state object
 * @param {boolean} replace - If true, replaces current history entry instead of pushing new one
 */
export function updateUrlParams(filters, replace = false) {
  if (typeof window === 'undefined') return;

  const queryString = serializeFiltersToUrl(filters);
  const newUrl = queryString
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;

  if (replace) {
    window.history.replaceState(null, '', newUrl);
  } else {
    window.history.pushState(null, '', newUrl);
  }
}

/**
 * Watch for URL changes (back/forward navigation)
 * Calls callback with new filter state when URL changes
 * @param {function} callback - Function to call with new filters: (filters) => void
 * @returns {function} Cleanup function to remove event listener
 */
export function watchUrlChanges(callback) {
  if (typeof window === 'undefined') return () => {};

  const handlePopState = () => {
    const filters = parseUrlToFilters();
    callback(filters);
  };

  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}

/**
 * Get default filter values
 * @returns {object} Default filter state
 */
function getDefaultFilters() {
  return {
    selectedDays: DEFAULTS.DEFAULT_SELECTED_DAYS,
    selectedBorough: DEFAULTS.DEFAULT_BOROUGH,
    weekPattern: DEFAULTS.DEFAULT_WEEK_PATTERN,
    priceTier: DEFAULTS.DEFAULT_PRICE_TIER,
    sortBy: DEFAULTS.DEFAULT_SORT_BY,
    selectedNeighborhoods: []
  };
}

/**
 * Check if current URL has any filter parameters
 * @returns {boolean} True if URL has filter parameters
 */
export function hasUrlFilters() {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  return params.toString().length > 0;
}

/**
 * Clear all filter parameters from URL
 */
export function clearUrlParams() {
  if (typeof window === 'undefined') return;

  window.history.pushState(null, '', window.location.pathname);
}

/**
 * Get shareable URL for current filters
 * @param {object} filters - Filter state object
 * @returns {string} Full shareable URL
 */
export function getShareableUrl(filters) {
  if (typeof window === 'undefined') return '';

  const queryString = serializeFiltersToUrl(filters);
  const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
