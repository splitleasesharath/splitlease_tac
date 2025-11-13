# Feature: Updates to the Search Schedule Selector

## Metadata
adw_id: `0b90bdb0`
prompt: `I want you to update the default selections in the Search schedule Selector shared react island component to be Monday- Friday. I want this to be set in the island component level and not the page level. i want to also ensure that the search schedule selector's selection is reflected in the url with a parameter. You can retrieve context on how this was implemented in this Search page standalone directory, that was the precursor input used to build the current multipage app's search page section. I want the Search schedule Selector to retrieve from the URL(only if the URL parameter is found and not empty) based on 0 based indexing, add selections to the Search schedule Selector. And vice versa, when selections are made, through/on the Search schedule Selector, the URL parameter is updated accordingly. I also want this URL parameter to be appended when redirecting from the index page to the Search page, when 'Explore Rentals' is clicked.`

## Feature Description
This feature enhances the Search Schedule Selector shared React island component (`DaySelector.jsx`) to have Monday-Friday as default selections at the component level, integrate URL parameter synchronization for shareable search states, and ensure the index/home page passes the schedule selection when redirecting to the search page. The implementation follows the existing URL parameter patterns used throughout the application and maintains consistency with the existing filter state management.

The feature ensures that:
1. The DaySelector component has Monday-Friday (indices 1-5) as default selected days when no URL parameter or parent-provided selection exists
2. The DaySelector component reads from and writes to URL parameters using the existing `days-selected` parameter format (0-based indexing)
3. The HomePage's "Explore Rentals" button includes the schedule selection in the redirect URL
4. All URL parameter handling follows the existing patterns in `urlParams.js`

## User Story
As a user searching for rental properties
I want the schedule selector to default to Monday-Friday and persist my selection in the URL
So that I can share search links with others, bookmark searches with specific schedules, and have a sensible default for weekday rentals

## Problem Statement
Currently, the DaySelector component does not have built-in default selections and relies entirely on parent components to manage state. There is no URL parameter integration at the component level, which means:
- Users cannot share search URLs with specific schedule selections
- Browser back/forward navigation doesn't preserve schedule selections
- The default selection logic is scattered across multiple page-level components
- When redirecting from the home page to the search page, the schedule selection is not consistently passed

This creates inconsistency in user experience and makes it difficult to share or bookmark specific searches.

## Solution Statement
Implement URL parameter integration directly in the DaySelector component while maintaining backward compatibility with parent-controlled state. The component will:
1. Accept a new optional `enableUrlSync` prop to enable URL parameter synchronization
2. Default to Monday-Friday (indices 1-5) when no URL parameter exists and no parent-provided selection
3. Read the `days-selected` URL parameter on mount and update internal state
4. Write to the `days-selected` URL parameter whenever selection changes (if `enableUrlSync` is enabled)
5. Maintain backward compatibility by allowing parent components to fully control state via props

The HomePage component will be updated to include the schedule selection in the URL when redirecting to the search page, using the existing `days-selected` parameter format.

## Relevant Files
Use these files to implement the feature:

- **`app/src/islands/shared/DaySelector.jsx`** - The shared React island component that needs URL parameter integration and default Monday-Friday selection
- **`app/src/islands/pages/SearchPage.jsx`** - The search page that uses DaySelector and already implements URL parameter synchronization for other filters (lines 674-740). This will be updated to enable URL sync for the DaySelector
- **`app/src/islands/pages/HomePage.jsx`** - The home page that has a Hero section with day selector and "Explore Rentals" button. The redirect logic (lines 642-658) needs to be updated to include schedule parameters
- **`app/src/lib/urlParams.js`** - Utility functions for URL parameter management. Already contains `parseDaysParam()` (lines 46-62) and serialization logic (lines 93-131) that we'll reuse
- **`app/src/lib/constants.js`** - Contains default values including `DEFAULT_SELECTED_DAYS: [1, 2, 3, 4, 5]` (line 362) which represents Monday-Friday

### New Files
No new files need to be created.

## Implementation Plan

### Phase 1: Foundation
Analyze existing URL parameter patterns in `urlParams.js` and understand how SearchPage currently manages filter state synchronization. Review the existing `parseDaysParam()` function and `serializeFiltersToUrl()` to ensure compatibility with the new component-level URL integration.

### Phase 2: Core Implementation
Add URL parameter synchronization capabilities to the DaySelector component:
- Add optional `enableUrlSync` prop with default value `false` for backward compatibility
- Add optional `defaultSelected` prop to allow customization of default days
- Implement URL parameter reading on component mount using `parseDaysParam()` logic
- Implement URL parameter writing when selection changes using History API
- Ensure the component respects parent-provided `selected` prop over URL parameters (parent always wins)
- Default to Monday-Friday when no URL parameter exists and no parent-provided selection

### Phase 3: Integration
Update parent components to utilize the new URL synchronization feature:
- Update SearchPage to enable URL sync by passing `enableUrlSync={true}` to DaySelector
- Update HomePage's "Explore Rentals" button to include `days-selected` parameter when redirecting
- Verify that browser back/forward navigation works correctly with the new URL synchronization
- Ensure the feature works seamlessly with existing filter URL parameters

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update DaySelector Component with URL Synchronization
- Add new props: `enableUrlSync` (boolean, default false), `defaultSelected` (array, default [1,2,3,4,5])
- Add internal state to track whether the component is URL-controlled or parent-controlled
- Add `useEffect` hook to read `days-selected` URL parameter on mount (only if `enableUrlSync` is true)
- Parse URL parameter using the same logic as `parseDaysParam()` from `urlParams.js` (0-based indexing, comma-separated)
- If URL parameter exists and is valid, use it as initial selection
- If URL parameter doesn't exist and parent hasn't provided `selected` prop, use `defaultSelected` (Monday-Friday)
- Add `useEffect` hook to write to `days-selected` URL parameter when selection changes (only if `enableUrlSync` is true)
- Use `window.history.replaceState()` to update URL without triggering page reload
- Add JSDoc comments documenting the new props and URL parameter format
- Ensure backward compatibility: if `enableUrlSync` is false, component behaves exactly as before

### 2. Update SearchPage to Enable URL Sync for DaySelector
- Modify the DaySelector component usage in FilterPanel (around line 105-110)
- Add `enableUrlSync={true}` prop to enable URL synchronization at component level
- Remove or simplify the page-level `selectedDays` state management since DaySelector now handles URL sync
- Update the `useEffect` that syncs filter state to URL (lines 705-723) to exclude `selectedDays` since component handles it
- Verify that the schedule filter still works correctly with the pricing calculation logic (lines 318-339 in PropertyCard)
- Ensure the day filter validation logic (lines 954-1023) still receives the correct selected days

### 3. Update HomePage to Pass Schedule Parameter on Redirect
- Update the `handleExploreRentals` function (lines 642-658)
- Change the redirect URL format from `/search.html?days-selected=${bubbleDays.join(',')}` to use 0-based indexing
- Ensure the URL parameter uses 0-based indexing (0-6) instead of 1-based (1-7) for consistency
- Update the ScheduleSection component's `handleScheduleClick` function (lines 280-283) to use 0-based indexing
- Update the ListingsPreview component's redirect URLs (lines 411-419) to use 0-based indexing
- Verify that all redirects from HomePage to SearchPage include the `days-selected` parameter

### 4. Update URL Parameter Utilities for Consistency
- Review `urlParams.js` to ensure `parseDaysParam()` function handles the correct format (0-based)
- Verify that `serializeFiltersToUrl()` correctly handles the `selectedDays` parameter
- Ensure URL parameter format is consistent: `days-selected=1,2,3,4,5` (0-based, comma-separated)
- Add inline comments documenting the URL parameter format for future maintainers

### 5. Test URL Parameter Integration End-to-End
- Test that navigating directly to `/search.html?days-selected=1,2,3,4,5` loads with Monday-Friday selected
- Test that changing the schedule selector updates the URL parameter
- Test that browser back/forward navigation restores the correct schedule selection
- Test that clicking "Explore Rentals" from HomePage navigates to SearchPage with the correct schedule parameter
- Test that the default Monday-Friday selection is applied when no URL parameter exists
- Test backward compatibility: ensure DaySelector still works in contexts where `enableUrlSync` is not enabled

### 6. Verify Integration with Existing Filters
- Test that the schedule selector works alongside other filters (borough, neighborhoods, price, etc.)
- Verify that the URL parameter is properly serialized with other filter parameters
- Test that the "Reset Filters" button (line 1132-1143) correctly resets the schedule to Monday-Friday
- Ensure that the lazy loading and listing display logic (lines 1111-1127) works correctly with schedule changes

### 7. Test Edge Cases and Error Handling
- Test with invalid URL parameters (e.g., `days-selected=abc`, `days-selected=10,20,30`)
- Test with empty URL parameter (e.g., `days-selected=`)
- Test with out-of-range values (e.g., `days-selected=-1,7,8`)
- Ensure that malformed parameters fall back to the default Monday-Friday selection
- Test that rapid selection changes don't cause URL parameter conflicts or performance issues

## Testing Strategy

### Unit Tests
1. **DaySelector URL Parsing Tests**
   - Test parsing valid URL parameters: `days-selected=1,2,3,4,5` should select Monday-Friday
   - Test parsing empty/missing parameters: should default to Monday-Friday
   - Test parsing invalid parameters: should fall back to Monday-Friday
   - Test parsing out-of-range values: should filter out invalid indices

2. **DaySelector URL Writing Tests**
   - Test that selection changes update the URL parameter correctly
   - Test that URL parameter format uses 0-based indexing
   - Test that URL updates use `replaceState` to avoid polluting browser history

3. **HomePage Redirect Tests**
   - Test that "Explore Rentals" button includes `days-selected` parameter
   - Test that schedule presets (weeknight, weekend, monthly) generate correct parameters
   - Test that the parameter format is 0-based and comma-separated

4. **Backward Compatibility Tests**
   - Test DaySelector without `enableUrlSync` prop (should behave as before)
   - Test DaySelector with parent-provided `selected` prop (parent should always win)
   - Test that existing page components that use DaySelector continue to work

### Edge Cases
1. **Malformed URL Parameters**
   - URL with non-numeric values: `days-selected=abc,def`
   - URL with out-of-range values: `days-selected=-1,10,20`
   - URL with mixed valid/invalid values: `days-selected=1,2,abc,3`
   - Empty parameter: `days-selected=`

2. **Browser Navigation**
   - Back button after changing schedule multiple times
   - Forward button after navigating back
   - Direct URL entry with schedule parameter
   - Refresh page with schedule parameter in URL

3. **Cross-Component State Conflicts**
   - Parent component updates `selected` prop while URL parameter exists (parent should win)
   - Multiple DaySelector instances on same page (should not conflict)
   - Schedule changes while other filters are being modified

4. **Performance**
   - Rapid selection changes (click multiple days quickly)
   - Large selection changes (select all days, then clear)
   - URL parameter updates don't cause unnecessary re-renders

## Acceptance Criteria
- [ ] DaySelector component defaults to Monday-Friday (indices 1-5) when no URL parameter exists and no parent-provided selection
- [ ] DaySelector component reads `days-selected` URL parameter on mount when `enableUrlSync={true}`
- [ ] DaySelector component updates `days-selected` URL parameter when selection changes (if enabled)
- [ ] SearchPage uses URL-synchronized DaySelector by passing `enableUrlSync={true}`
- [ ] HomePage "Explore Rentals" button includes `days-selected` parameter in redirect URL
- [ ] All schedule-related redirects from HomePage use 0-based indexing for consistency
- [ ] URL parameter format is consistent: `days-selected=1,2,3,4,5` (0-based, comma-separated)
- [ ] Browser back/forward navigation correctly restores schedule selection
- [ ] Invalid URL parameters fall back to Monday-Friday default
- [ ] Parent-provided `selected` prop always overrides URL parameter (parent control always wins)
- [ ] Backward compatibility maintained: DaySelector works without `enableUrlSync` prop
- [ ] Schedule selector integrates seamlessly with existing filters (borough, neighborhoods, price, sort)
- [ ] No regression in existing functionality: pricing calculation, day filtering, lazy loading all work correctly
- [ ] "Reset Filters" button resets schedule to Monday-Friday
- [ ] Shareable URLs with schedule parameters work correctly when sent to other users

## Validation Commands
Execute these commands to validate the feature is complete:

- `npm run dev` - Start development server and manually test the following scenarios:
  1. Navigate to `/search.html` and verify Monday-Friday is selected by default
  2. Change schedule selection and verify URL parameter updates to `?days-selected=...`
  3. Copy URL, open in new tab, and verify selection is restored
  4. Use browser back button after changing schedule and verify previous selection is restored
  5. Navigate to `/` (home page), select days, click "Explore Rentals", and verify redirect includes `?days-selected=...`
  6. Test "weeknight", "weekend", and "monthly" schedule buttons on home page
  7. Navigate to `/search.html?days-selected=999` and verify it falls back to Monday-Friday
  8. Navigate to `/search.html?days-selected=1,2,3` and verify only Mon-Tue-Wed are selected

- `npm run build` - Build production assets and verify no errors
  - Check that the build completes successfully without TypeScript or linting errors
  - Verify that the built assets include the updated DaySelector component

- Manual browser testing in multiple browsers (Chrome, Firefox, Safari):
  - Test URL parameter parsing and serialization
  - Test browser back/forward navigation
  - Test URL sharing and bookmarking
  - Test that rapid selection changes don't cause errors or performance issues

## Notes

### Implementation Considerations
1. **URL Parameter Format**: Use 0-based indexing (0-6) for consistency with JavaScript's day numbering. This matches the existing `parseDaysParam()` function in `urlParams.js`.

2. **State Management Priority**: When both URL parameter and parent-provided `selected` prop exist, the parent prop should always take precedence. This ensures parent components maintain full control when needed.

3. **History API Strategy**: Use `window.history.replaceState()` for URL updates to avoid polluting browser history with every selection change. This provides a better user experience when using the back button.

4. **Backward Compatibility**: The `enableUrlSync` prop defaults to `false` to ensure existing implementations continue to work without modification. Only the SearchPage will explicitly enable URL sync.

5. **Default Selection Logic**:
   - If URL parameter exists AND `enableUrlSync=true`: Use URL parameter
   - Else if parent provides `selected` prop: Use parent's value
   - Else: Use `defaultSelected` (Monday-Friday)

### Future Enhancements
1. **URL Parameter Debouncing**: Consider adding debouncing for URL parameter updates if users report performance issues with rapid selection changes.

2. **Advanced Schedule Presets**: Could add more schedule presets (e.g., "Mon-Wed-Fri", "Tue-Thu") to the home page for common rental patterns.

3. **Schedule Validation**: Could add validation to ensure selected days meet the contiguity requirement before updating URL parameter.

4. **Analytics Integration**: Track how often users share URLs with schedule parameters to measure feature adoption.

### Related Issues
- Issue #16: Updates to the Search Schedule Selector (this feature)
- Original implementation reference: The feature draws from patterns in the standalone search page that preceded the current multipage app implementation.
