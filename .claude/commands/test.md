# Application Validation Test Suite

Execute comprehensive validation tests for the Split Lease TAC application, returning results in a standardized JSON format for automated processing.

## Purpose

Proactively identify and fix issues in the Split Lease TAC application before they impact users or developers. By running this comprehensive test suite, you can:
- Verify dependencies are properly installed
- Ensure Vite build completes successfully
- Validate environment configuration
- Check React Island components compile correctly
- Verify production build succeeds
- Ensure the application is in a healthy state

## Variables

TEST_COMMAND_TIMEOUT: 5 minutes

## Instructions

- Execute each test in the sequence provided below
- Capture the result (passed/failed) and any error messages
- IMPORTANT: Return ONLY the JSON array with test results
  - IMPORTANT: Do not include any additional text, explanations, or markdown formatting
  - We'll immediately run JSON.parse() on the output, so make sure it's valid JSON
- If a test passes, omit the error field
- If a test fails, include the error message in the error field
- Execute all tests even if some fail
- Error Handling:
  - If a command returns non-zero exit code, mark as failed and immediately stop processing tests
  - Capture stderr output for error field
  - Timeout commands after `TEST_COMMAND_TIMEOUT`
  - IMPORTANT: If a test fails, stop processing tests and return the results thus far
- Test execution order is important - dependencies should be validated first
- All file paths are relative to the project root
- Always run `pwd` and `cd` before each test to ensure you're operating in the correct directory for the given test

## Test Execution Sequence

### Split Lease TAC Application Tests

1. **Dependencies Installation**
   - Preparation Command: `cd app`
   - Command: `npm install`
   - test_name: "dependencies_install"
   - test_purpose: "Ensures all npm dependencies are installed correctly, including React 18.2.0, Vite 5.0.0, @supabase/supabase-js, framer-motion, lucide-react, and lottie-react"

2. **Environment Configuration Check**
   - Preparation Command: `cd app`
   - Command: `test -f .env || test -f .env.example`
   - test_name: "environment_check"
   - test_purpose: "Verifies that environment configuration exists (.env or .env.example file) for Supabase and other API keys"

3. **Vite Configuration Validation**
   - Preparation Command: `cd app`
   - Command: `test -f vite.config.js && node -c vite.config.js`
   - test_name: "vite_config_validation"
   - test_purpose: "Verifies that vite.config.js exists and is syntactically correct JavaScript"

4. **Package.json ESM Check**
   - Preparation Command: `cd app`
   - Command: `grep -q '"type": "module"' package.json && echo "ESM configured"`
   - test_name: "esm_check"
   - test_purpose: "Ensures package.json has type: module for ESM-only architecture"

5. **React Islands Structure Check**
   - Preparation Command: `cd app`
   - Command: `test -d src/islands && test -d src/lib && echo "Directory structure valid"`
   - test_name: "structure_check"
   - test_purpose: "Verifies that required directory structure exists (src/islands/, src/lib/)"

6. **Vite Build**
   - Preparation Command: `cd app`
   - Command: `npm run build`
   - test_name: "vite_build"
   - test_purpose: "Builds the application using Vite, compiling all React Islands and assets to dist/ directory, ensuring successful production bundle generation"

7. **Built Output Validation**
   - Preparation Command: `cd app`
   - Command: `test -d dist && test -f dist/index.html && echo "Build output valid"`
   - test_name: "build_output_validation"
   - test_purpose: "Verifies that the build output directory exists and contains expected HTML entry points"

## Report

- IMPORTANT: Return results exclusively as a JSON array based on the `Output Structure` section below.
- Sort the JSON array with failed tests (passed: false) at the top
- Include all tests in the output, both passed and failed
- The execution_command field should contain the exact command that can be run to reproduce the test
- This allows subsequent agents to quickly identify and resolve errors

### Output Structure

```json
[
  {
    "test_name": "string",
    "passed": boolean,
    "execution_command": "string",
    "test_purpose": "string",
    "error": "optional string"
  },
  ...
]
```

### Example Output

```json
[
  {
    "test_name": "component_build",
    "passed": false,
    "execution_command": "cd app/split-lease/components && npm run build",
    "test_purpose": "Validates the complete component build process, compiling React components to UMD bundles via Vite",
    "error": "TS2345: Argument of type 'string' is not assignable to parameter of type 'number'"
  },
  {
    "test_name": "component_contract_tests",
    "passed": true,
    "execution_command": "cd app/test-harness && npx playwright test --grep \"contract\"",
    "test_purpose": "Validates component contracts using Playwright browser tests, ensuring components render without errors"
  }
]
```