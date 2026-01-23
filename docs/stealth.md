# Stealth

The `Stealth` class provides human-like input simulation utilities for realistic browser interactions using Playwright. It includes natural typing patterns, human-like cursor movements, and stealth capabilities to make automated interactions appear more authentic.

## Constructor

Creates a new `Stealth` instance. You must provide either an existing `page` or a `baseURL` to create a stealth context, but not both.

### Arguments

`options`: An object with one of the following:
- `page` (Page): An existing Playwright Page instance to use for fill/click operations
- `baseURL` (string): Base URL for creating a new stealth browser context

```ts
// With existing page
const stealth = new Stealth({ page });

// With baseURL to create stealth context
const stealth = new Stealth({ baseURL: "https://example.com" });
```

## fill

Simulates human-like typing with random delays, backspaces, and corrections. Uses ghost-cursor for natural cursor movement to the field before typing.

### Arguments

`field` (Locator): The Playwright Locator for the input field.
`value` (string): The text value to type.
`delay` (optional): Base delay in milliseconds. Defaults to 500.

```ts
await stealth.fill({
  field: page.locator("#username"),
  value: "myusername",
  delay: 500,
});
```

## click

Simulates human-like clicking with natural cursor movement and random delays. Uses Bezier curves and overshoot effects for realistic mouse movement.

### Arguments

`element` (Locator): The Playwright Locator for the element to click.
`delay` (optional): Base delay in milliseconds. Defaults to 500.

```ts
await stealth.click({
  element: page.locator("#submit-button"),
  delay: 1000,
});
```

## page

Creates or returns the default page for fill/click operations. If no page exists (when using `baseURL`), it will create a stealth context and a new page automatically.

```ts
const page = await stealth.page();
await page.goto("https://example.com");
```

**Note:** When using `baseURL` in the constructor, the page is automatically created on first use of `fill()` or `click()`. You can also call `page()` explicitly to get the page instance.

## newPage

Creates a new page from the stealth context. Useful when you need multiple pages. The stealth context will be created automatically if it doesn't exist.

```ts
const page1 = await stealth.page(); // Default page
const page2 = await stealth.newPage(); // Additional page
await page2.goto("https://example.com/about");
```

## context

Creates or returns the stealth browser context with fingerprint injection and automation evasion. The context includes various stealth features to avoid detection.

```ts
const context = await stealth.context();
const page = await context.newPage();
```

## close

Closes the browser context and browser instance. Also closes the page if it was created via `baseURL`. Call this when you're done to clean up resources.

```ts
await stealth.close();
```
