# stealth-input

Human-like input simulation utilities for realistic browser interactions with Playwright.

## Installation

```bash
yarn add stealth-input
```

or with npm:

```bash
npm install stealth-input
```

**Note:** This package requires `@playwright/test` as a peer dependency. Make sure you have it installed:

```bash
yarn add @playwright/test
```

or with npm:

```bash
npm install @playwright/test
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

## API

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

## How It Works

### `simulateTypingWithDelay`
- Types a portion of the text (60-80% of the total length)
- Simulates human-like mistakes by pressing backspace a few times
- Completes typing the remaining text
- Uses randomized delays throughout to mimic natural typing patterns

### `simulateClickWithDelay`
- Calculates a slight offset from the center of the element
- Hovers over the element first
- Clicks with a randomized delay (1000-2000ms) to simulate human hesitation

## License

MIT

## Author

Sojan Varghese
