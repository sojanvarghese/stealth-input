## Installation

```bash
yarn add stealth-input
```

## Usage

Import and instantiate the `Stealth` class:

```typescript
import { Stealth } from 'stealth-input';
import { test } from '@playwright/test';

test('example test', async ({ page }) => {
  const stealth = new Stealth();

  // Navigate to your page
  await page.goto('https://example.com');

  // Simulate human-like typing
  const inputField = page.locator('#username');
  await stealth.simulateTypingWithDelay({
    field: inputField,
    value: 'myusername',
    delay: 500 // optional, defaults to 500ms
  });

  // Simulate human-like clicking
  const button = page.locator('#submit');
  await stealth.simulateClickWithDelay({
    element: button,
    page: page
  });
});
```

### `Stealth` Class

#### `simulateTypingWithDelay(options)`

Simulates human-like typing with random delays, backspaces, and corrections. This makes automated input appear more natural and less detectable.

**Parameters:**
- `field` (Locator): The Playwright Locator for the input field
- `value` (string): The text value to type
- `delay` (number, optional): Base delay in milliseconds. Defaults to 500.

**Example:**
```typescript
await stealth.simulateTypingWithDelay({
  field: page.locator('#email'),
  value: 'user@example.com',
  delay: 500
});
```

#### `simulateClickWithDelay(options)`

Simulates human-like clicking with random delays and slight offset from center. This makes automated clicks appear more natural and less detectable.

**Parameters:**
- `element` (Locator): The Playwright Locator for the element to click
- `page` (Page): The Playwright Page instance

**Example:**
```typescript
await stealth.simulateClickWithDelay({
  element: page.locator('#submit-button'),
  page: page
});
```
