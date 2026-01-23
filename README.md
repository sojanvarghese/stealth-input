## Installation

```bash
yarn add @sojanvarghese/stealth-input
```

## Usage

Import and instantiate the `Stealth` class:

```typescript
import { Stealth } from '@sojanvarghese/stealth-input';
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
