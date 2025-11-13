# Schedule Selector URL Synchronization and Default Selection

**ADW ID:** 0449ff2b
**Date:** 2025-11-13
**Specification:** specs/feature-0449ff2b-schedule-selector-url-sync.md

## Overview

This feature implements bidirectional synchronization between the Search Schedule Selector (DaySelector) component and URL parameters, sets Monday-Friday as the default selection at the component level, and ensures proper propagation of schedule selections when navigating from the home page to the search page. All day selection state is now persisted in URL parameters using consistent 0-based indexing, enabling users to share search criteria via URLs and maintain preferences across page navigations.

## What Was Built

- **URL Parameter Reading**: DaySelector now initializes from URL parameters (`?days-selected=1,2,3,4,5`) using 0-based indexing
- **URL Parameter Writing**: Day selections are synchronized to the browser URL in real-time with validation and error handling
- **Default Selection**: Monday-Friday (indices 1-5) as the default when no URL parameter is present
- **Cross-Page Navigation**: HomePage "Explore Rentals" button correctly passes day selections to SearchPage via URL
- **Consistent Indexing**: Unified 0-based indexing system across HomePage, SearchPage, and URL parameters
- **Enhanced Documentation**: Comprehensive JSDoc comments explaining URL synchronization behavior and indexing conventions

## Technical Implementation

### Files Modified

- `app/src/lib/urlParams.js`: Enhanced URL parameter parsing and serialization
  - Added robust validation for `days-selected` parameter with invalid value filtering
  - Added development mode warnings for malformed URL parameters
  - Changed serialization to always include days-selected parameter (not just when non-default)
  - Improved documentation with examples of valid parameter formats

- `app/src/islands/shared/DaySelector.jsx`: Updated component documentation
  - Added comprehensive JSDoc comments explaining URL synchronization flow
  - Clarified that DaySelector is a controlled component with parent managing URL state
  - Documented 0-based indexing convention (0=Sunday through 6=Saturday)
  - Added usage examples for SearchPage integration

- `app/src/islands/pages/HomePage.jsx`: Fixed URL parameter handling
  - Removed incorrect Bubble API format conversion (`fromBubbleDays`/`toBubbleDays`)
  - Updated `loadStateFromURL()` to parse 0-based indices with validation
  - Updated `updateURL()` to use 0-based indexing consistently
  - Updated `handleExploreRentals()` to pass 0-based day indices to search page
  - Added extensive comments documenting the indexing system and URL format

### Key Changes

1. **Unified 0-Based Indexing**: All URL parameters now use JavaScript's native 0-based day indexing (0=Sunday, 6=Saturday) instead of mixing with Bubble API's 1-based format. This eliminates conversion errors and maintains consistency across the application.

2. **Enhanced URL Validation**: The `parseDaysParam()` function now includes validation that filters invalid day indices, logs warnings in development mode, and gracefully falls back to Monday-Friday default when parameters are malformed.

3. **Always-Include Days Parameter**: Changed URL serialization to always include the `days-selected` parameter (even when using defaults) to create complete, shareable URLs with full filter state.

4. **HomePage Navigation Fix**: Corrected the `handleExploreRentals()` function to pass day selections using 0-based indexing instead of converting to Bubble format, ensuring SearchPage correctly reads the URL parameter.

5. **Improved Documentation**: Added comprehensive inline documentation explaining the URL synchronization flow, indexing conventions, and the relationship between DaySelector, SearchPage, and URL state management.

## How to Use

### For Users

1. **Navigate to Search Page**: When you visit the search page without URL parameters, Monday-Friday will be pre-selected by default.

2. **Change Day Selection**: Click on days in the calendar selector to change your selection. The URL will update automatically (e.g., `?days-selected=0,6` for weekends).

3. **Share Your Search**: Copy the URL from your browser to share your exact search criteria with others. The day selection will be preserved when they open the link.

4. **Navigate from Home Page**: On the home page, select your desired days and click "Explore Rentals". Your selection will be carried over to the search page via URL parameters.

5. **Use Browser Navigation**: Back/forward buttons work correctly - your day selections will be restored when navigating through browser history.

### For Developers

1. **URL Parameter Format**: Use `?days-selected=1,2,3,4,5` with 0-based, comma-separated day indices (0=Sunday, 6=Saturday).

2. **Reading URL State**: The `parseUrlToFilters()` function in `urlParams.js` automatically parses the `days-selected` parameter and returns a `selectedDays` array.

3. **Writing URL State**: Call `serializeFiltersToUrl(filters)` to generate URL parameters from current filter state, then use `updateUrlParams()` to update the browser URL.

4. **Default Behavior**: When `days-selected` is missing or invalid, the system falls back to `DEFAULTS.DEFAULT_SELECTED_DAYS` ([1,2,3,4,5] = Monday-Friday).

5. **Validation**: Invalid day indices are filtered out with warnings in development mode. If all values are invalid, the system falls back to defaults.

## Configuration

### Constants Used

- **`DEFAULTS.DEFAULT_SELECTED_DAYS`** (from `app/src/lib/constants.js`): `[1, 2, 3, 4, 5]` - Monday through Friday in 0-based indexing

### URL Parameter Specification

- **Parameter Name**: `days-selected`
- **Format**: Comma-separated list of integers 0-6
- **Examples**:
  - Weekdays: `?days-selected=1,2,3,4,5`
  - Weekends: `?days-selected=0,6`
  - Friday through Monday: `?days-selected=5,6,0,1`
  - Invalid: `?days-selected=invalid` (falls back to default)

### Development Warnings

When `import.meta.env.DEV` is true, the system logs console warnings for:
- Invalid day indices in URL parameters
- Empty or malformed parameter values
- Fallback to default selection

## Testing

### Manual Testing

1. **Default Selection Test**:
   - Navigate to `/search.html` with no parameters
   - Verify Monday-Friday (5 days) are selected

2. **URL Parameter Reading Test**:
   - Navigate to `/search.html?days-selected=0,6`
   - Verify Sunday and Saturday are selected

3. **URL Parameter Writing Test**:
   - Load search page and change day selection
   - Verify URL updates immediately in browser address bar

4. **HomePage Navigation Test**:
   - Open home page, select Tuesday-Thursday
   - Click "Explore Rentals"
   - Verify URL is `/search.html?days-selected=2,3,4`
   - Verify search page shows correct selection

5. **Invalid Parameter Test**:
   - Navigate to `/search.html?days-selected=invalid`
   - Verify Monday-Friday default is used
   - Check console for warning (in dev mode)

6. **Browser Navigation Test**:
   - Make several selection changes
   - Use back/forward buttons
   - Verify selections are restored correctly

### Validation Commands

```bash
# Navigate to app directory
cd app

# Build the project to verify no errors
npm run build

# Run development server for manual testing
npm run dev
```

## Notes

### 0-Based Indexing Convention

All JavaScript code and URL parameters use 0-based indexing:
- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

This matches JavaScript's `Date.getDay()` method. Conversion to Bubble API's 1-based indexing happens only when communicating with the backend API (via `toBubbleDays()` utility in `dayUtils.js`).

### Architecture Pattern

- **DaySelector**: Controlled component that receives `selected` prop and calls `onChange` callback
- **SearchPage**: Manages day selection state and URL synchronization
- **urlParams.js**: Centralized URL parameter parsing and serialization utilities
- **HomePage**: Independent URL state management for hero section, passes state to SearchPage via URL

### Controlled Component Benefits

DaySelector is a controlled component, meaning the parent (SearchPage or HomePage) owns the state. This design:
- Allows parent to synchronize state with URL
- Enables validation before state changes
- Makes testing easier (mock parent state)
- Follows React best practices

### Future Enhancements

- Consider adding named presets (e.g., `?schedule=weekdays` as shorthand)
- Add localStorage persistence as fallback when URL parameter is absent
- Centralize Bubble API conversion logic to reduce duplication
- Consider refactoring HomePage to use shared DaySelector component
