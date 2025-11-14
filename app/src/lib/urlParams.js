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
 * Format: "1,2,3,4,5" (comma-separated day indices, 0-based)
 * Day numbering: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
 * Example: "1,2,3,4,5" represents Monday-Friday
 * @param {string|null} daysParam - The days parameter from URL
 * @returns {Array<number>} Array of day indices (0-6)
 */
function parseDaysParam(daysParam) {
  if (!daysParam) {
    return DEFAULTS.DEFAULT_SELECTED_DAYS;
  }

  try {
    // Parse comma-separated day indices (0-based)
    const days = daysParam
      .split(',')
      .map(d => parseInt(d.trim(), 10))
      .filter(d => !isNaN(d) && d >= 0 && d <= 6); // Valid range: 0-6

    return days.length > 0 ? days : DEFAULTS.DEFAULT_SELECTED_DAYS;
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

  // Add days-selected parameter (only if not default)
  // Format: comma-separated day indices (0-based, e.g., "1,2,3,4,5" for Monday-Friday)
  if (filters.selectedDays && filters.selectedDays.length > 0) {
    const daysString = filters.selectedDays.join(',');
    const defaultDaysString = DEFAULTS.DEFAULT_SELECTED_DAYS.join(',');
    if (daysString !== defaultDaysString) {
      params.set('days-selected', daysString);
    }
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
 * Preserves existing URL parameters that aren't being updated (e.g., days-selected managed by DaySelector)
 * @param {object} filters - Filter state object
 * @param {boolean} replace - If true, replaces current history entry instead of pushing new one
 */
export function updateUrlParams(filters, replace = false) {
  if (typeof window === 'undefined') return;

  // Start with existing URL parameters to preserve parameters managed by other components
  const params = new URLSearchParams(window.location.search);

  // Update only the parameters that are in the filters object
  // This preserves parameters like 'days-selected' that might be managed by DaySelector

  // Update days-selected parameter (only if included in filters)
  if (filters.selectedDays !== undefined) {
    if (filters.selectedDays && filters.selectedDays.length > 0) {
      const daysString = filters.selectedDays.join(',');
      const defaultDaysString = DEFAULTS.DEFAULT_SELECTED_DAYS.join(',');
      if (daysString !== defaultDaysString) {
        params.set('days-selected', daysString);
      } else {
        params.delete('days-selected');
      }
    } else {
      params.delete('days-selected');
    }
  }

  // Update borough parameter (only if included in filters)
  if (filters.selectedBorough !== undefined) {
    if (filters.selectedBorough && filters.selectedBorough !== DEFAULTS.DEFAULT_BOROUGH) {
      params.set('borough', filters.selectedBorough);
    } else {
      params.delete('borough');
    }
  }

  // Update week pattern parameter (only if included in filters)
  if (filters.weekPattern !== undefined) {
    if (filters.weekPattern && filters.weekPattern !== DEFAULTS.DEFAULT_WEEK_PATTERN) {
      params.set('weekly-frequency', filters.weekPattern);
    } else {
      params.delete('weekly-frequency');
    }
  }

  // Update price tier parameter (only if included in filters)
  if (filters.priceTier !== undefined) {
    if (filters.priceTier && filters.priceTier !== DEFAULTS.DEFAULT_PRICE_TIER) {
      params.set('pricetier', filters.priceTier);
    } else {
      params.delete('pricetier');
    }
  }

  // Update sort parameter (only if included in filters)
  if (filters.sortBy !== undefined) {
    if (filters.sortBy && filters.sortBy !== DEFAULTS.DEFAULT_SORT_BY) {
      params.set('sort', filters.sortBy);
    } else {
      params.delete('sort');
    }
  }

  // Update neighborhoods parameter (only if included in filters)
  if (filters.selectedNeighborhoods !== undefined) {
    if (filters.selectedNeighborhoods && filters.selectedNeighborhoods.length > 0) {
      params.set('neighborhoods', filters.selectedNeighborhoods.join(','));
    } else {
      params.delete('neighborhoods');
    }
  }

  const queryString = params.toString();
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
