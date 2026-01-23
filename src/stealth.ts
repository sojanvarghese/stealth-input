import { Locator, Page } from "@playwright/test";
import { createCursor, type Cursor } from "ghost-cursor-playwright";

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
  private cursor!: Cursor;

  constructor(public page: Page) {}

  private async getCursor(): Promise<Cursor> {
    if (!this.cursor) {
      // TypeScript sees @playwright/test.Page and ghost-cursor-playwright's playwright-core.Page
      // as incompatible types, but they are compatible at runtime since @playwright/test
      // re-exports playwright-core types. This is a known limitation when packages have
      // their own playwright-core dependency.
      // @ts-expect-error - Runtime compatible types from different package versions
      this.cursor = await createCursor(this.page, {
        overshootSpread: 10,
        overshootRadius: 120,
        debug: false,
      });
    }
    return this.cursor;
  }

  fill = async ({ field, value, delay = 500 }: FillProps) => {
    const min = Math.max(3, Math.floor(value.length * 0.6));
    const maxLength = Math.max(4, Math.floor(value.length * 0.8));
    const partOffset = Math.floor(Math.random() * (maxLength - min + 1));
    const sliceLength = partOffset + min;

    const estimatedBackspaceCap = Math.min(4, Math.floor(sliceLength * 0.3));
    const maxBackspaceCount = Math.max(2, estimatedBackspaceCap);
    const backspaceOffset = Math.floor(Math.random() * (maxBackspaceCount - 1));
    const backspaceCount = backspaceOffset + 2;

    const textPart1 = value.slice(0, sliceLength);
    const textPart2 = value.slice(sliceLength - backspaceCount);

    const cursor = await this.getCursor();
    const boundingBox = await field.boundingBox();
    await cursor.actions.click(
      {
        target: boundingBox!,
        waitBeforeClick: [300, 700],
        waitBetweenClick: [20, 50],
      },
      {
        paddingPercentage: 20,
        waitBeforeMove: [100, 300],
      }
    );

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
    const cursor = await this.getCursor();
    const boundingBox = await element.boundingBox();
    await cursor.actions.click(
      {
        target: boundingBox!,
        waitBeforeClick: delay ? [delay, delay + 500] : [500, 1500],
        waitBetweenClick: [20, 50],
      },
      {
        paddingPercentage: 20,
        waitBeforeMove: [100, 300],
      }
    );
  };
}
