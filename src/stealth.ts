import {
  Browser,
  BrowserContext,
  chromium,
  Locator,
  Page,
} from "@playwright/test";
import { createCursor, type Cursor } from "ghost-cursor-playwright";
import { newInjectedContext } from "fingerprint-injector";

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
  private stealthContext!: BrowserContext;
  private stealthBrowser!: Browser;

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

  context = async (baseURL?: string): Promise<BrowserContext> => {
    if (!this.stealthContext) {
      await this.launchContext(baseURL);
      await this.addInitScript();
    }
    return this.stealthContext;
  };

  private launchContext = async (baseURL?: string) => {
    this.stealthBrowser = await chromium.launch({
      args: ["--disable-blink-features=AutomationControlled"],
    });

    this.stealthContext = await newInjectedContext(this.stealthBrowser, {
      fingerprintOptions: {
        devices: ["desktop"],
        operatingSystems: ["ios"],
      },
      newContextOptions: {
        geolocation: {
          latitude: 39.0438, // Ashburn, VA
          longitude: -77.4874, // Ashburn, VA
        },
        timezoneId: "America/New_York", // Ashburn, VA timezone
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        locale: "en-US",
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        ...(baseURL ? { baseURL } : {}),
      },
    });
  };

  private addInitScript = () =>
    this.stealthContext.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });

      Object.defineProperty(navigator, "mediaDevices", {
        get: () => ({
          enumerateDevices: () => [
            { kind: "audioinput", label: "Microphone", deviceId: "default" },
            { kind: "videoinput", label: "Webcam", deviceId: "default" },
          ],
        }),
      });

      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });

      Object.defineProperty(window, "chrome", {
        writable: true,
        configurable: true,
        value: { runtime: {}, loadTimes: () => ({}), csi: () => ({}) },
      });

      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter) {
        if (parameter === 37445) return "Intel Inc."; // UNMASKED_VENDOR_WEBGL
        if (parameter === 37446) return "Intel Iris OpenGL Engine"; // UNMASKED_RENDERER_WEBGL
        return getParameter.call(this, parameter);
      };
    });

  close = async () => {
    await this.stealthContext.close();
    await this.stealthBrowser.close();
  };
}
