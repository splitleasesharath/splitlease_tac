# Feature: Search Schedule Selector URL Synchronization and Default Selection

## Metadata
adw_id: `0449ff2b`
prompt: `I want you to update the default selections in the Search schedule Selector shared react island component to be Monday- Friday. I want this to be set in the island component level and not the page level. i want to also ensure that the search schedule selector's selection is reflected in the url with a parameter. You can retrieve context on how this was implemented in this Search page standalone directory, that was the precursor input used to build the current multipage app's search page section.
I want the Search schedule Selector to retrieve from the URL(only if the URL parameter is found and not empty) based on 0 based indexing, add selections to the Search schedule Selector. And vice versa, when selections are made, through/on the Search schedule Selector, the URL parameter is updated accordingly.

I also want this URL parameter to be appended when redirecting from the index page to the Search page, when 'Explore Rentals' is clicked.`

## Feature Description
This feature updates the Search Schedule Selector (DaySelector) component to have Monday-Friday as the default selection at the component level, ensures bidirectional synchronization between the component's selection state and URL parameters, and propagates the schedule selection from the index page to the search page when users click "Explore Rentals".

The feature will:
1. Set Monday-Friday (days 1-5 in 0-based indexing) as the default selection in the DaySelector component itself
2. Make the DaySelector component read from URL parameters (`days-selected`) on initialization
3. Update the URL parameter whenever selections change in the DaySelector
4. Ensure the HomePage's "Explore Rentals" button appends the current schedule selection to the search URL

## User Story
As a user searching for split lease properties
I want the schedule selector to default to weekdays (Monday-Friday) and persist my selection in the URL
So that I can share my search criteria with others and have my preferences maintained across page navigations

## Problem Statement
Currently, the DaySelector component may not have appropriate defaults set at the component level, and the URL synchronization for the schedule selector is not fully implemented. When users navigate from the index page to the search page, their day selections may not be properly carried over via URL parameters. This creates a fragmented user experience where:
- Users cannot share specific day selections via URL
- Day selections are lost during navigation between pages
- The default selection may not match typical use cases (weekday rentals)

## Solution Statement
We will enhance the DaySelector shared component to:
1. Accept a `defaultSelected` prop with a fallback to Monday-Friday (1,2,3,4,5)
2. Initialize from URL parameters when available using the existing `parseUrlToFilters()` utility
3. Emit selection changes that trigger URL updates in the parent SearchPage component
4. Update the HomePage component's navigation logic to include schedule parameters in the search URL

This solution leverages the existing URL parameter management system (`urlParams.js`) and follows the established pattern where SearchPage manages URL synchronization for all filters.

## Relevant Files

### Core Component Files
- **`app/src/islands/shared/DaySelector.jsx`** (lines 1-447)
  - Main schedule selector component
  - Currently handles selection logic, validation, and drag functionality
  - Needs to support default selection via props and URL initialization

- **`app/src/islands/pages/SearchPage.jsx`** (lines 653-1343)
  - Parent component that uses DaySelector
  - Already handles URL synchronization for filters (lines 705-723)
  - Currently initializes selectedDays from URL (line 676)
  - Needs to ensure DaySelector is properly integrated with URL state

- **`app/src/islands/pages/HomePage.jsx`** (lines 585-728)
  - Homepage component with hero section containing day selector
  - Has handleExploreRentals function (lines 642-658) that navigates to search page
  - Currently includes days in URL (line 656) but needs to use consistent 0-based indexing

### Utility Libraries
- **`app/src/lib/urlParams.js`** (lines 1-223)
  - URL parameter management utilities
  - `parseUrlToFilters()` - parses URL to filter state (lines 23-38)
  - `parseDaysParam()` - parses days-selected parameter (lines 40-62)
  - `serializeFiltersToUrl()` - serializes filters to URL (lines 89-131)
  - `updateUrlParams()` - updates browser URL (lines 134-152)
  - Already handles `days-selected` parameter with 0-based indexing

- **`app/src/lib/constants.js`** (lines 356-365)
  - Application constants including DEFAULTS object
  - `DEFAULT_SELECTED_DAYS: [1, 2, 3, 4, 5]` - Monday-Friday in 0-based indexing (line 362)

### New Files
None required - all changes are modifications to existing files.

## Implementation Plan

### Phase 1: Foundation - Constants and URL Parameter Validation
Verify that the existing URL parameter system correctly handles the `days-selected` parameter with 0-based indexing and that the constants are properly configured.

### Phase 2: Core Implementation - DaySelector Component Enhancement
Update the DaySelector component to accept default selections via props, falling back to the constant DEFAULT_SELECTED_DAYS when no URL parameter or prop is provided.

### Phase 3: Integration - SearchPage and HomePage URL Synchronization
Ensure SearchPage properly initializes DaySelector from URL and updates URL when selections change. Update HomePage to use consistent 0-based indexing when navigating to the search page.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify URL Parameter Handling for days-selected
- Review `urlParams.js` to confirm `parseDaysParam()` correctly handles 0-based indexing (lines 40-62)
- Verify `serializeFiltersToUrl()` correctly formats the `days-selected` parameter (lines 97-103)
- Confirm `parseUrlToFilters()` returns `selectedDays` as 0-based array (line 31)
- Test that DEFAULT_SELECTED_DAYS in constants.js is `[1, 2, 3, 4, 5]` (Monday-Friday, 0-based)

### 2. Update DaySelector Component to Accept Default Selection Prop
- Add `defaultSelected` prop to DaySelector component props destructuring (around line 40)
- Update prop documentation in JSDoc comment to include `defaultSelected` parameter (lines 30-37)
- Set default value for `defaultSelected` to `DEFAULTS.DEFAULT_SELECTED_DAYS` from constants.js
- Import DEFAULTS from constants.js at the top of DaySelector.jsx

### 3. Initialize DaySelector from Props
- Update the DaySelector component to use the `selected` prop if provided, otherwise fall back to `defaultSelected`
- Ensure this logic respects the parent component's state when `selected` is explicitly passed
- Add logic to handle empty `selected` arrays by using `defaultSelected`

### 4. Verify SearchPage URL Initialization
- Confirm SearchPage correctly parses URL on mount using `parseUrlToFilters()` (line 673)
- Verify selectedDays state is initialized from URL filters (line 676)
- Ensure the state flows correctly to DaySelector via props (line 1187)
- Confirm URL updates when selectedDays changes (lines 705-723)

### 5. Update HomePage Navigation to Use Consistent 0-Based Indexing
- Review HomePage's `handleExploreRentals` function (lines 642-658)
- Check the current day index conversion on line 656
- Update to ensure 0-based indexing is used consistently (remove the `+ 1` conversion if present)
- Verify the function uses the same format as SearchPage expects

### 6. Test URL Parameter Flow from HomePage to SearchPage
- Verify clicking "Explore Rentals" on HomePage with days selected creates correct URL
- Confirm SearchPage reads the URL parameter and initializes DaySelector correctly
- Test that empty/missing days-selected parameter uses Monday-Friday default
- Verify URL is updated when user changes selection in SearchPage DaySelector

### 7. Add Defensive Coding and Edge Case Handling
- Add validation for `days-selected` parameter format (comma-separated integers 0-6)
- Handle malformed URL parameters gracefully by falling back to defaults
- Ensure at least minimum required days are selected (respecting minDays constraint)
- Add console warnings in development mode for invalid parameters

### 8. Update Component Documentation
- Add JSDoc comments explaining the URL synchronization behavior
- Document the 0-based indexing convention
- Add examples of valid `days-selected` URL parameter formats
- Update any existing comments that may be outdated

## Testing Strategy

### Unit Tests
- **DaySelector Default Selection**
  - Test DaySelector renders with Monday-Friday selected when no props provided
  - Test DaySelector uses `defaultSelected` prop when provided
  - Test DaySelector uses `selected` prop over `defaultSelected` when both provided

- **URL Parameter Parsing**
  - Test `parseDaysParam()` with valid comma-separated values: "1,2,3,4,5"
  - Test with single day: "0"
  - Test with all days: "0,1,2,3,4,5,6"
  - Test with empty/null/undefined parameter returns default
  - Test with invalid values (out of range, non-numeric) returns default
  - Test with wrap-around selection: "5,6,0,1" (Friday-Monday)

- **URL Serialization**
  - Test `serializeFiltersToUrl()` correctly formats days array to comma-separated string
  - Test empty array does not add days-selected parameter
  - Test default array (1,2,3,4,5) is correctly serialized

### Integration Tests
- **HomePage to SearchPage Navigation**
  - Click "Explore Rentals" with Monday-Friday selected → verify URL contains `days-selected=1,2,3,4,5`
  - Click "Explore Rentals" with custom selection (e.g., weekend) → verify correct URL parameter
  - Navigate to search page with URL parameter → verify DaySelector shows correct selection

- **SearchPage URL Synchronization**
  - Load SearchPage with `?days-selected=1,2,3` → verify DaySelector shows Mon-Tue-Wed
  - Change selection in DaySelector → verify URL updates immediately
  - Use browser back button → verify DaySelector reflects previous selection

- **Default Behavior**
  - Load SearchPage without URL parameters → verify Monday-Friday selected
  - Load HomePage → verify hero day selector shows Monday-Friday by default

### Edge Cases
- **Invalid URL Parameters**
  - `days-selected=invalid` → should use Monday-Friday default
  - `days-selected=7,8,9` → should filter invalid values or use default
  - `days-selected=` (empty value) → should use default
  - Missing parameter entirely → should use default

- **Browser Navigation**
  - Forward/back buttons maintain selection state
  - Refresh page maintains URL parameter
  - Share URL with parameters works correctly

- **Contiguity Validation**
  - Non-contiguous days in URL (e.g., "0,2,4") → DaySelector shows error state
  - Contiguous days with wrap-around (e.g., "5,6,0") → DaySelector accepts and displays correctly

- **Minimum Days Constraint**
  - URL with fewer than minimum days (e.g., "1,2" when minDays=3) → component shows validation error
  - Component prevents de-selection below minimum days

## Acceptance Criteria

1. ✅ **DaySelector Default Selection**
   - DaySelector component renders with Monday-Friday (1,2,3,4,5) selected by default when loaded without URL parameters
   - Default is set at component level via DEFAULTS.DEFAULT_SELECTED_DAYS constant
   - Default can be overridden via `defaultSelected` prop

2. ✅ **URL Parameter Reading (SearchPage → DaySelector)**
   - Loading SearchPage with `?days-selected=1,2,3,4,5` shows Monday-Friday selected in DaySelector
   - Loading with `?days-selected=0,6` shows Sunday and Saturday selected
   - Loading without parameter shows Monday-Friday default
   - Invalid or malformed parameters fall back to Monday-Friday default

3. ✅ **URL Parameter Writing (DaySelector → SearchPage → URL)**
   - Selecting/deselecting days in DaySelector immediately updates URL parameter
   - URL format is `?days-selected=X,Y,Z` where X,Y,Z are 0-based day indices
   - Browser back/forward buttons work correctly with selection state
   - URL can be copied and shared to reproduce selection

4. ✅ **HomePage Integration**
   - Clicking "Explore Rentals" on HomePage navigates to `/search.html?days-selected=X,Y,Z`
   - The day parameter uses 0-based indexing consistently
   - Default selection (Monday-Friday) is included in URL even if unchanged
   - Custom selections made on HomePage are preserved in the URL

5. ✅ **Edge Case Handling**
   - Empty or missing `days-selected` parameter uses Monday-Friday default
   - Invalid parameter values are filtered or cause fallback to default
   - Minimum days constraint is respected (validates against `minDays` prop)
   - Non-contiguous selections trigger appropriate validation errors

6. ✅ **User Experience**
   - Selection state is maintained during navigation (forward/back)
   - URL updates happen smoothly without page reload
   - Shared URLs work correctly for recipients
   - Component respects all existing validation rules (contiguity, minimum nights)

## Validation Commands
Execute these commands to validate the feature is complete:

### 1. Code Quality and Compilation
```bash
# Navigate to app directory
cd "C:\Users\igor\OneDrive\Documents\TAC - Split Lease\trees\0449ff2b\app"

# Verify no syntax errors in modified files
npm run build

# Check for console errors/warnings
# (Run dev server and check browser console)
npm run dev
```

### 2. Manual Testing Checklist
- [ ] Open http://localhost:5173/index.html → Verify hero day selector shows Monday-Friday selected
- [ ] Click "Explore Rentals" → Verify URL is `/search.html?days-selected=1,2,3,4,5`
- [ ] Verify search page DaySelector shows Monday-Friday selected
- [ ] Change selection to just Monday (1) → Verify URL updates to `?days-selected=1`
- [ ] Change to Friday-Sunday (5,6,0) → Verify URL updates to `?days-selected=5,6,0`
- [ ] Copy URL and open in new tab → Verify same selection appears
- [ ] Click browser back button → Verify previous selection is restored
- [ ] Directly navigate to `/search.html` (no params) → Verify Monday-Friday default
- [ ] Navigate to `/search.html?days-selected=invalid` → Verify Monday-Friday default
- [ ] Navigate to `/search.html?days-selected=0,2,4` → Verify non-contiguous error appears

### 3. Cross-Page Integration Test
```bash
# Test HomePage → SearchPage flow
# 1. Open http://localhost:5173/index.html
# 2. Select Tuesday-Thursday in hero selector
# 3. Click "Explore Rentals"
# 4. Verify URL is /search.html?days-selected=2,3,4
# 5. Verify search page selector shows Tuesday-Thursday selected
```

### 4. URL Parameter Validation Test
```bash
# Test URL parameter handling
# Open each URL and verify behavior:
# http://localhost:5173/search.html → Monday-Friday default
# http://localhost:5173/search.html?days-selected=1,2,3,4,5 → Monday-Friday
# http://localhost:5173/search.html?days-selected=0,6 → Sunday, Saturday
# http://localhost:5173/search.html?days-selected=5,6,0,1 → Fri-Mon (wrap)
# http://localhost:5173/search.html?days-selected=invalid → Monday-Friday default
```

### 5. Browser Navigation Test
```bash
# Test browser history integration
# 1. Navigate to search page with default (Mon-Fri)
# 2. Change to Weekend (Fri-Sun-Mon): 5,6,0,1
# 3. Change to Weekday (Mon-Fri): 1,2,3,4,5
# 4. Click back button → should show Weekend
# 5. Click back button → should show Mon-Fri
# 6. Click forward button → should show Weekend
# 7. Click forward button → should show Weekday
```

## Notes

### Implementation Strategy
- **Leverage Existing Infrastructure**: The URL parameter system (`urlParams.js`) already handles `days-selected` with 0-based indexing. We should reuse this rather than reimplementing.
- **Component-Level Defaults**: Set defaults in DaySelector component props, not in parent components, for better reusability.
- **Controlled Component Pattern**: DaySelector should remain a controlled component, with SearchPage managing the actual state and URL synchronization.

### 0-Based Indexing Convention
All JavaScript code uses 0-based indexing for days:
- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

This is consistent with JavaScript's `Date.getDay()` method and simplifies array indexing. The Bubble API uses 1-based indexing, but conversion is handled explicitly where needed.

### URL Parameter Format
- **Parameter name**: `days-selected`
- **Format**: Comma-separated list of day indices (0-based)
- **Example**: `?days-selected=1,2,3,4,5` (Monday-Friday)
- **Special case**: Empty or missing parameter → use `[1,2,3,4,5]` default

### Related Features
This feature relates to the existing filter URL synchronization system in SearchPage. All filter changes (borough, neighborhoods, price tier, week pattern, sort by) already update the URL. This feature extends that pattern to include the schedule selector.

### Future Considerations
- Consider adding named presets (e.g., `?schedule=weekdays` as shorthand for `?days-selected=1,2,3,4,5`)
- Add URL parameter validation on the server side if implementing server-side rendering
- Consider persisting user's last selection in localStorage as a fallback when URL parameters are absent
- Add analytics tracking for most common day selection patterns

### Technical Debt
- The HomePage component uses a slightly different day selection implementation than SearchPage. Consider refactoring to use the shared DaySelector component on HomePage as well for consistency.
- The conversion between 0-based (JavaScript) and 1-based (Bubble API) indexing happens in multiple places. Consider centralizing this in `dayUtils.js`.

### Dependencies
No new npm packages required. This feature uses existing dependencies:
- React hooks (useState, useEffect, useCallback)
- Existing utility libraries (urlParams.js, constants.js)
- Browser History API (already in use)
