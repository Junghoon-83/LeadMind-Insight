# Quick Start Guide - Testing

## Installation

1. Install all dependencies:
```bash
npm install
```

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (for continuous integration)
npm run test:ci
```

## Viewing Results

### Console Output

After running tests, you'll see:
- Number of tests passed/failed
- Test execution time
- Coverage percentages (if --coverage flag used)

### Coverage Report

After running `npm run test:coverage`:

1. Open the HTML report:
```bash
# macOS
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html

# Windows
start coverage/lcov-report/index.html
```

2. Browse coverage by file to see:
   - Line coverage (green = covered, red = not covered)
   - Branch coverage
   - Function coverage

## Understanding Test Output

### Successful Test Run
```
PASS  src/lib/__tests__/auth.test.ts
  auth utilities
    ✓ should hash a password (125ms)
    ✓ should verify correct password (98ms)
    ✓ should reject incorrect password (97ms)

Test Suites: 8 passed, 8 total
Tests:       223 passed, 223 total
Snapshots:   0 total
Time:        12.456s
```

### Failed Test Run
```
FAIL  src/lib/__tests__/auth.test.ts
  auth utilities
    ✕ should verify correct password (102ms)

  ● auth utilities › should verify correct password

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      32 |       const isValid = await verifyPassword(password, hash);
      33 |
    > 34 |       expect(isValid).toBe(true);
         |                       ^
      35 |     });
```

## Common Test Commands

### Run Specific Tests

```bash
# Run tests for a specific file
npm test -- auth.test.ts

# Run tests matching a pattern
npm test -- --testPathPattern=lib

# Run tests with a specific name
npm test -- --testNamePattern="login"

# Run tests for changed files only
npm test -- --onlyChanged
```

### Debug Tests

```bash
# Run with verbose output
npm test -- --verbose

# Run single test file
npm test -- src/lib/__tests__/auth.test.ts

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Expected Coverage

The project has coverage thresholds set to:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

Tests will fail if coverage drops below these thresholds.

## Test Files Location

```
src/
├── lib/__tests__/              # Utility function tests
│   ├── auth.test.ts
│   ├── validations.test.ts
│   ├── fetch.test.ts
│   └── logger.test.ts
├── store/__tests__/            # State management tests
│   └── useAdminStore.test.ts
├── components/__tests__/       # Component tests
│   └── ErrorBoundary.test.tsx
└── app/api/                    # API route tests
    └── admin/
        ├── auth/__tests__/route.test.ts
        └── content/__tests__/route.test.ts
```

## Troubleshooting

### Tests Hanging
If tests don't complete:
1. Press `Ctrl+C` to stop
2. Check for unresolved promises
3. Ensure proper cleanup in tests

### Mock Errors
If mocks aren't working:
1. Check that mocks are defined before imports
2. Use `jest.clearAllMocks()` in `beforeEach()`
3. Verify mock implementation

### Coverage Not Generated
If coverage isn't showing:
1. Run with `--coverage` flag: `npm test -- --coverage`
2. Check `jest.config.js` settings
3. Ensure test files import the code being tested

## Next Steps

- Read [TESTING.md](./TESTING.md) for detailed documentation
- Read [TEST_SUMMARY.md](./TEST_SUMMARY.md) for implementation overview
- Check coverage report to find untested code
- Add tests for new features before implementation (TDD)

## Need Help?

- Check test examples in `src/**/__tests__/`
- Read Jest docs: https://jestjs.io/
- Read Testing Library docs: https://testing-library.com/
- Check error messages carefully - they usually point to the issue

## Example Test Run

```bash
$ npm test

> leadmind-insight@0.1.0 test
> jest

 PASS  src/lib/__tests__/logger.test.ts
 PASS  src/lib/__tests__/fetch.test.ts
 PASS  src/lib/__tests__/auth.test.ts
 PASS  src/lib/__tests__/validations.test.ts
 PASS  src/store/__tests__/useAdminStore.test.ts
 PASS  src/components/__tests__/ErrorBoundary.test.tsx
 PASS  src/app/api/admin/auth/__tests__/route.test.ts
 PASS  src/app/api/admin/content/__tests__/route.test.ts

Test Suites: 8 passed, 8 total
Tests:       223 passed, 223 total
Snapshots:   0 total
Time:        12.456 s
Ran all test suites.
```

## CI/CD

Tests automatically run on:
- Push to main/develop branches
- Pull requests
- Scheduled runs (if configured)

Check the Actions tab on GitHub to see test results.
