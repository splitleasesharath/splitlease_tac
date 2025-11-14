# Review

Follow the `Instructions` below to **review work done against a specification file** (specs/*.md) to ensure implemented features match requirements. Use the spec file to understand the requirements and then use the git diff if available to understand the changes made. Capture screenshots of critical functionality paths as documented in the `Instructions` section. If there are issues, report them if not then report success.

## Variables

adw_id: $ARGUMENT
spec_file: $ARGUMENT
agent_name: $ARGUMENT if provided, otherwise use 'review_agent'
review_image_dir: `<absolute path to codebase>/agents/<adw_id>/<agent_name>/review_img/`

## Instructions

- **IMPORTANT: Execute `/no_fallback_check` FIRST** to scan for fallback mechanisms and hardcoded data
  - **DO NOT return the no_fallback_check report as your final output**
  - **Extract any blocking issues** from the report and add them to your review_issues array with:
    - `issue_type`: 'fallback_mechanism' or 'hardcoded_data'
    - `issue_severity`: Based on the report's assessment
    - `issue_description`: The fallback/hardcoded data found
    - `issue_resolution`: How to fix it
  - **If no_fallback_check finds no issues**, note this internally and continue with the review
  - **Continue to the next steps** after processing no_fallback_check results
- Check current git branch using `git branch` to understand context
- Run `git diff origin/main` to see all changes made in current branch. Continue even if there are no changes related to the spec file.
- Find the spec file by looking for specs/*.md files in the diff that match the current branch name
- Read the identified spec file to understand requirements
- IMPORTANT: If the work can be validated by UI validation then (if not skip the section):
  - Use the playwright mcp server commands to validate the work.
  - Look for corresponding e2e test files in ./claude/commands/e2e/test_*.md that mirror the feature name
  - Use e2e test files only as navigation guides for screenshot locations, not for other purposes
  - IMPORTANT: To be clear, we're not testing. We know the functionality works. We're reviewing the implementation against the spec to make sure it matches what was requested.
  - IMPORTANT: Take screen shots along the way to showcase the new functionality and any issues you find
    - Capture visual proof of working features through targeted screenshots
    - Navigate to the application and capture screenshots of only the critical paths based on the spec
    - Compare implemented changes with spec requirements to verify correctness
    - Do not take screenshots of the entire process, only the critical points.
    - IMPORTANT: Aim for `1-5` screenshots to showcase that the new functionality works as specified.
    - If there is a review issue, take a screenshot of the issue and add it to the `review_issues` array. Describe the issue, resolution, and severity.
    - Number your screenshots in the order they are taken like `01_<descriptive name>.png`, `02_<descriptive name>.png`, etc.
    - IMPORTANT: Be absolutely sure to take a screen shot of the critical point of the new functionality
    - IMPORTANT: Copy all screenshots to the provided `review_image_dir`
    - IMPORTANT: Store the screenshots in the `review_image_dir` and be sure to use full absolute paths.
    - Focus only on critical functionality paths - avoid unnecessary screenshots
    - Ensure screenshots clearly demonstrate that features work as specified
    - Use descriptive filenames that indicate what part of the change is being verified
- IMPORTANT: Issue Severity Guidelines
  - ULTRATHINK about the impact of the issue on the feature and the user
  - Guidelines:
    - `skippable` - the issue is non-blocker for the work to be released but is still a problem
    - `tech_debt` - the issue is non-blocker for the work to be released but will create technical debt that should be addressed in the future
    - `blocker` - the issue is a blocker for the work to be released and should be addressed immediately. It will harm the user experience or will not function as expected.
- IMPORTANT: Return ONLY the JSON array with test results
  - IMPORTANT: Output your result in JSON format based on the `Report` section below.
  - IMPORTANT: Do not include any additional text, explanations, or markdown formatting
  - We'll immediately run JSON.parse() on the output, so make sure it's valid JSON
- UULTRATHINK as you work through the review process. Focus on the critical functionality paths and the user experience. Don't report issues if they are not critical to the feature.

## Setup

IMPORTANT: Read and **Execute** `.claude/commands/prepare_app.md` now to prepare the application for the review.
- Note: prepare_app.md will automatically detect and use ports from `.ports.env` if running in a worktree environment
- The application URL will be http://localhost:PORT where PORT is from `.ports.env` (FRONTEND_PORT) or default 5173

## Report

- IMPORTANT: Return results exclusively as a JSON array based on the `Output Structure` section below.
- `success` should be `true` if there are NO BLOCKING issues (implementation matches spec for critical functionality)
- `success` should be `false` ONLY if there are BLOCKING issues that prevent the work from being released
- `review_issues` can contain issues of any severity (skippable, tech_debt, or blocker)
- `screenshots` should ALWAYS contain paths to screenshots showcasing the new functionality, regardless of success status. Use full absolute paths.
- This allows subsequent agents to quickly identify and resolve blocking errors while documenting all issues

### Output Structure

```json
{
    success: "boolean - true if there are NO BLOCKING issues (can have skippable/tech_debt issues), false if there are BLOCKING issues",
    review_summary: "string - 2-4 sentences describing what was built and whether it matches the spec. Written as if reporting during a standup meeting. Example: 'The natural language query feature has been implemented with drag-and-drop file upload and interactive table display. The implementation matches the spec requirements for SQL injection protection and supports both CSV and JSON formats. Minor UI improvements could be made but all core functionality is working as specified.'",
    review_issues: [
        {
            "review_issue_number": "number - the issue number based on the index of this issue",
            "screenshot_path": "string - /absolute/path/to/screenshot_that_shows_review_issue.png",
            "issue_description": "string - description of the issue",
            "issue_resolution": "string - description of the resolution",
            "issue_severity": "string - severity of the issue between 'skippable', 'tech_debt', 'blocker'",
            "issue_type": "string - type of issue: 'fallback_mechanism', 'hardcoded_data', 'functional', 'ui', 'performance', 'security', or 'other'"
        },
        ...
    ],
    screenshots: [
        "string - /absolute/path/to/screenshot_showcasing_functionality.png",
        "string - /absolute/path/to/screenshot_showcasing_functionality.png",
        "...",
    ]
}
```

---

# CRITICAL FINAL INSTRUCTIONS

**YOUR ENTIRE RESPONSE MUST BE VALID JSON MATCHING THE OUTPUT STRUCTURE ABOVE.**

**DO NOT:**
- ❌ Return the no_fallback_check markdown report as your output
- ❌ Return any markdown, explanations, summaries, or headers
- ❌ Use markdown code fences like ```json or ```
- ❌ Add any text before or after the JSON
- ❌ Return incomplete JSON or work-in-progress messages

**YOU MUST:**
- ✅ Complete the ENTIRE review process (no_fallback_check → git diff → spec analysis → UI validation → screenshots)
- ✅ Return ONLY raw JSON with no markdown formatting
- ✅ Include all screenshot paths in the screenshots array
- ✅ Include any fallback/hardcoded data issues found by no_fallback_check in the review_issues array
- ✅ Ensure the JSON is valid and parseable by JSON.parse()

**Example of CORRECT output (exactly like this, nothing else):**
```
{"success": true, "review_summary": "The search schedule selector URL synchronization has been implemented with Monday-Friday defaults. All URL parameters work correctly and the implementation matches the spec requirements.", "review_issues": [], "screenshots": ["/absolute/path/to/01_screenshot.png", "/absolute/path/to/02_screenshot.png"]}
```

**Example of WRONG output (DO NOT DO THIS):**
```
# Fallback Mechanism Audit Report

## Analysis Summary
...

Here's my review in JSON:
{"success": true, ...}
```

**REMEMBER:** If you execute /no_fallback_check, process its findings and then CONTINUE with the rest of the review. Do NOT return the no_fallback_check report as your final output. Your final output is ONLY the JSON structure shown above.