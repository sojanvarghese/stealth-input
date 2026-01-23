import { Locator, Page } from "@playwright/test";

interface FillProps {
  field: Locator;
  value: string;
  delay?: number;
}

interface ClickProps {
  element: Locator;
  delay?: number;
}

export class Stealth {
  constructor(public page: Page) {}

  fill = async ({ field, value, delay = 500 }: FillProps) => {
    const minSliceLength = Math.max(3, Math.floor(value.length * 0.6));
    const maxSliceLength = Math.max(4, Math.floor(value.length * 0.8));
    const sliceLength =
      Math.floor(Math.random() * (maxSliceLength - minSliceLength + 1)) +
      minSliceLength;

    const maxBackspaceCount = Math.max(
      2,
      Math.min(4, Math.floor(sliceLength * 0.3))
    );
    const backspaceCount =
      Math.floor(Math.random() * (maxBackspaceCount - 1)) + 2;

    const textPart1 = value.slice(0, sliceLength);
    const textPart2 = value.slice(sliceLength - backspaceCount);

    await field.hover();
    await field.click({ delay: Math.floor(Math.random() * delay) + 700 });

    await field.pressSequentially(textPart1, {
      delay: Math.floor(Math.random() * delay) + 400,
      timeout: 30_000,
    });

    for (let i = 0; i < backspaceCount; i++) {
      await field.press("Backspace", {
        delay: Math.floor(Math.random() * 1000) + 300,
      });
    }

    await field.pressSequentially(textPart2, {
      delay: Math.floor(Math.random() * delay) + 700,
      timeout: 45_000,
    });
  };

  click = async ({ element, delay }: ClickProps) => {
    const locatorBoundingBox = await element.boundingBox();
    const clickX = locatorBoundingBox!.x + locatorBoundingBox!.width / 2 + 10;
    const clickY = locatorBoundingBox!.y + locatorBoundingBox!.height / 2 - 10;
    await element.hover();
    await this.page.mouse.click(clickX, clickY, {
      delay: delay ?? Math.floor(Math.random() * 1000) + 1000,
    });
  };
}
