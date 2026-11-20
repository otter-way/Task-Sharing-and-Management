import { expect, it } from "vite-plus/test";
import { dataUrlBytes } from "./image-to-data-url";

it("measures the decoded size of a data URL", () => {
  expect(dataUrlBytes(`data:image/webp;base64,${"A".repeat(400)}`)).toBe(300);
});
