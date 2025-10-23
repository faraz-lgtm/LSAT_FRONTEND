# E2E Testing with Playwright

This project uses Playwright for end-to-end testing to ensure your application works correctly from the user's perspective.

## 🚀 Quick Start

### Prerequisites
- Node.js (LTS version recommended)
- Development server running on `http://localhost:5173`

### Important Note
All dashboard routes are prefixed with `/dashboard/`:
- Login: `/dashboard/sign-in`
- Tasks: `/dashboard/tasks`
- Calendar: `/dashboard/calendar`
- Orders: `/dashboard/orders`

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests with visible browser
npm run test:e2e:headed

# Run only login tests
npm run test:e2e:login

# Debug tests step by step
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## 📁 Test Structure

```
tests/
├── basic.spec.ts              # Basic page functionality tests
├── login.spec.ts              # Comprehensive login tests
├── login-simplified.spec.ts   # Simplified login tests using utilities
└── utils/
    └── auth-utils.ts          # Authentication test utilities
```

## 🔧 Test Utilities

### AuthTestUtils Class

The `AuthTestUtils` class provides convenient methods for testing authentication:

```typescript
import { AuthTestUtils } from './utils/auth-utils';

const authUtils = new AuthTestUtils(page);

// Mock successful login
await authUtils.mockSuccessfulLogin();

// Mock failed login
await authUtils.mockFailedLogin(401, 'Invalid credentials');

// Complete login flow
await authUtils.loginWithMockedSuccess('user@example.com', 'password123');

// Set authenticated state
await authUtils.setAuthenticatedState({ id: 1, roles: ['ADMIN'] });
```

### Common Test Data

```typescript
import { AuthTestData } from './utils/auth-utils';

// Use predefined test data
await authUtils.fillLoginForm(
  AuthTestData.validCredentials.email,
  AuthTestData.validCredentials.password
);
```

## 🧪 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/feature-page');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.getByText('Expected Text')).toBeVisible();
  });
});
```

### Authentication Tests

```typescript
import { test, expect } from '@playwright/test';
import { AuthTestUtils, AuthTestData } from './utils/auth-utils';

test.describe('Login Tests', () => {
  let authUtils: AuthTestUtils;

  test.beforeEach(async ({ page }) => {
    authUtils = new AuthTestUtils(page);
    await page.goto('/dashboard/sign-in');
  });

  test('should login successfully', async ({ page }) => {
    await authUtils.loginWithMockedSuccess();
    await authUtils.waitForLoginRedirect();
    await expect(page).toHaveURL('/');
  });
});
```

## 🎯 Test Categories

### 1. Login Tests (`login*.spec.ts`)
- Form validation
- Authentication flow
- Error handling
- Redirect behavior
- Success/failure scenarios

### 2. Basic Functionality Tests (`basic.spec.ts`)
- Page loading
- Navigation
- UI elements visibility
- Basic interactions

### 3. Feature-Specific Tests
- Tasks page functionality
- Calendar page functionality
- Orders page functionality
- Admin vs User role differences

## 🔍 Debugging Tests

### Visual Debugging
```bash
# Run with UI mode for step-by-step debugging
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug -- --grep "should login successfully"
```

### Screenshots and Videos
- Screenshots are automatically taken on test failures
- Videos are recorded for failed tests
- All artifacts are saved in `test-results/`

### Trace Viewer
```bash
# View detailed trace of test execution
npx playwright show-trace test-results/trace.zip
```

## 📊 Test Reports

After running tests, you can view detailed reports:

```bash
# Open HTML report
npm run test:e2e:report

# View in browser
open playwright-report/index.html
```

## 🚨 Common Issues

### 1. Tests Timing Out
- Ensure dev server is running on `http://localhost:5173`
- Check if elements exist before interacting with them
- Use `waitFor` methods for dynamic content

### 2. Authentication Issues
- Use `AuthTestUtils` for consistent auth mocking
- Clear auth state between tests
- Mock API responses appropriately

### 3. Element Not Found
- Use more specific selectors
- Wait for elements to be visible
- Check if elements are in iframes or shadow DOM

## 🎨 Best Practices

1. **Use Page Object Model** for complex pages
2. **Mock API responses** instead of relying on real backend
3. **Test user journeys** not just individual features
4. **Use data-testid attributes** for reliable element selection
5. **Keep tests independent** - each test should be able to run in isolation
6. **Use meaningful test names** that describe the expected behavior

## 🔄 CI/CD Integration

Tests are configured to run in CI environments:

- Automatic retries on failure
- Parallel execution
- Artifact collection (screenshots, videos, traces)
- JSON report generation for CI systems

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
