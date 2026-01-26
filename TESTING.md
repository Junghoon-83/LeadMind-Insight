# Testing Documentation

## Overview

This document describes the testing setup and strategies for the LeadMind Insight project.

## Test Stack

- **Test Framework**: Jest 29
- **React Testing**: React Testing Library
- **Mocking**: Jest mocks and spies
- **Coverage**: Jest coverage reports

## Setup

### Installation

Install test dependencies:

```bash
npm install
```

### Configuration Files

- `jest.config.js` - Jest configuration
- `jest.setup.js` - Global test setup and mocks
- `tsconfig.json` - TypeScript configuration (includes test files)

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Test Patterns

Run specific test files:

```bash
# Run tests for specific file
npm test -- auth.test.ts

# Run tests matching pattern
npm test -- --testPathPattern=lib

# Run tests for specific describe block
npm test -- --testNamePattern="login"
```

## Test Structure

### Directory Structure

```
src/
├── lib/
│   ├── auth.ts
│   └── __tests__/
│       └── auth.test.ts
├── store/
│   ├── useAdminStore.ts
│   └── __tests__/
│       └── useAdminStore.test.ts
├── components/
│   ├── ErrorBoundary.tsx
│   └── __tests__/
│       └── ErrorBoundary.test.tsx
└── app/
    └── api/
        └── admin/
            └── auth/
                ├── route.ts
                └── __tests__/
                    └── route.test.ts
```

## Test Coverage

### Current Coverage

The project aims for the following coverage thresholds:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Viewing Coverage Reports

After running tests with coverage:

```bash
npm run test:coverage
```

Coverage reports are generated in:
- Console output (summary)
- `coverage/lcov-report/index.html` (detailed HTML report)
- `coverage/lcov.info` (LCOV format for CI tools)

## Test Categories

### 1. Unit Tests

Test individual functions and utilities in isolation.

**Location**: `src/lib/__tests__/`

**Examples**:
- `auth.test.ts` - Authentication utilities
- `validations.test.ts` - Zod validation schemas
- `fetch.test.ts` - Fetch wrapper utilities
- `logger.test.ts` - Logging utilities

**Best Practices**:
- Test both success and error cases
- Mock external dependencies
- Test edge cases and boundary conditions
- Use descriptive test names

### 2. Store Tests

Test Zustand store logic and state management.

**Location**: `src/store/__tests__/`

**Examples**:
- `useAdminStore.test.ts` - Admin authentication store

**Best Practices**:
- Test state changes
- Test async actions
- Test error handling
- Mock API calls
- Reset store state between tests

### 3. Component Tests

Test React components and user interactions.

**Location**: `src/components/__tests__/`

**Examples**:
- `ErrorBoundary.test.tsx` - Error boundary component

**Best Practices**:
- Test user interactions
- Test different props and states
- Test accessibility
- Use React Testing Library queries
- Avoid testing implementation details

### 4. API Route Tests

Test Next.js API routes.

**Location**: `src/app/api/**/__tests__/`

**Examples**:
- `route.test.ts` - API endpoint tests

**Best Practices**:
- Test all HTTP methods
- Test authentication
- Test validation
- Test error responses
- Mock database calls

## Writing Tests

### Basic Test Structure

```typescript
import { functionToTest } from '../module';

describe('functionToTest', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionToTest(input);

    // Assert
    expect(result).toBe('expected');
  });

  it('should handle errors', () => {
    expect(() => functionToTest(null)).toThrow();
  });
});
```

### Testing Async Functions

```typescript
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toEqual({ id: 1 });
});
```

### Testing React Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

it('should render and handle click', () => {
  render(<MyComponent />);

  const button = screen.getByRole('button');
  fireEvent.click(button);

  expect(screen.getByText('Clicked')).toBeInTheDocument();
});
```

### Testing with Zustand

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyStore } from '../useMyStore';

it('should update state', () => {
  const { result } = renderHook(() => useMyStore());

  act(() => {
    result.current.setValue('new value');
  });

  expect(result.current.value).toBe('new value');
});
```

## Mocking

### Mock Fetch

```typescript
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

mockFetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'test' }),
} as Response);
```

### Mock Modules

```typescript
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));
```

### Mock Environment Variables

```typescript
beforeEach(() => {
  process.env.TEST_VAR = 'test-value';
});

afterEach(() => {
  delete process.env.TEST_VAR;
});
```

## Best Practices

### 1. Test Naming

Use descriptive names that explain what is being tested:

```typescript
// Good
it('should return error when password is incorrect')

// Bad
it('test login')
```

### 2. Test Organization

Group related tests using `describe` blocks:

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data');
    it('should throw error with invalid email');
  });

  describe('updateUser', () => {
    it('should update user with valid data');
  });
});
```

### 3. Setup and Teardown

Use lifecycle hooks for common setup:

```typescript
describe('MyTest', () => {
  beforeEach(() => {
    // Runs before each test
  });

  afterEach(() => {
    // Runs after each test
  });

  beforeAll(() => {
    // Runs once before all tests
  });

  afterAll(() => {
    // Runs once after all tests
  });
});
```

### 4. Arrange-Act-Assert Pattern

Structure tests clearly:

```typescript
it('should do something', () => {
  // Arrange - Set up test data
  const input = 'test';

  // Act - Execute the code
  const result = myFunction(input);

  // Assert - Verify the result
  expect(result).toBe('expected');
});
```

### 5. Test Independence

Each test should be independent and not rely on others:

```typescript
// Good - Each test is independent
it('test 1', () => { /* ... */ });
it('test 2', () => { /* ... */ });

// Bad - Tests depend on execution order
let sharedState;
it('test 1', () => { sharedState = 'value'; });
it('test 2', () => { expect(sharedState).toBe('value'); });
```

### 6. Mock External Dependencies

Always mock external dependencies:

```typescript
// Mock database
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();
```

## Common Patterns

### Testing Error Boundaries

```typescript
const ThrowError = () => {
  throw new Error('Test error');
};

it('should catch error', () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Error message')).toBeInTheDocument();
});
```

### Testing Form Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('should submit form', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText('Password'), 'test123');
  await user.click(screen.getByRole('button', { name: 'Login' }));

  expect(mockSubmit).toHaveBeenCalled();
});
```

### Testing Async Operations

```typescript
it('should load data', async () => {
  render(<DataComponent />);

  // Wait for async operation
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Tests Failing in CI but Passing Locally

- Check for timezone issues
- Check for race conditions
- Ensure proper cleanup between tests
- Check environment variable differences

### Timeout Errors

Increase timeout for slow tests:

```typescript
it('slow test', async () => {
  // Test code
}, 10000); // 10 second timeout
```

### Mock Not Working

Ensure mock is set up before importing module:

```typescript
// Good
jest.mock('@/lib/module');
import { useModule } from '@/lib/module';

// Bad
import { useModule } from '@/lib/module';
jest.mock('@/lib/module');
```

## CI Integration

Tests run automatically in CI with:

```bash
npm run test:ci
```

This command:
- Runs all tests once (no watch mode)
- Generates coverage reports
- Uses limited workers for CI environment
- Fails if coverage thresholds are not met

## Future Improvements

1. **Integration Tests**: Add tests that test multiple components together
2. **E2E Tests**: Add Playwright tests for full user flows
3. **Performance Tests**: Add performance benchmarks
4. **Visual Regression Tests**: Add screenshot comparison tests
5. **API Contract Tests**: Add OpenAPI/Swagger validation

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Zustand Testing](https://github.com/pmndrs/zustand#testing)
