import { describe, expect, it } from "vite-plus/test";
import { signInErrorKey } from "./sign-in-error-key";

describe("signInErrorKey", () => {
  it("translates a wrong email or password", () => {
    expect(signInErrorKey("INVALID_EMAIL_OR_PASSWORD")).toBe(
      "auth:signInForm.invalidCredentials",
    );
  });

  it("translates an unverified email", () => {
    expect(signInErrorKey("EMAIL_NOT_VERIFIED")).toBe(
      "auth:signInForm.emailNotVerified",
    );
  });

  it("leaves other failures to the server message", () => {
    expect(signInErrorKey("TOO_MANY_REQUESTS")).toBeNull();
    expect(signInErrorKey(undefined)).toBeNull();
  });
});
