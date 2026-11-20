// Sign-in failures the form explains in the interface language. Other codes
// fall back to the server's message.
export function signInErrorKey(code: string | undefined) {
  if (code === "EMAIL_NOT_VERIFIED") return "auth:signInForm.emailNotVerified";
  if (code === "INVALID_EMAIL_OR_PASSWORD") {
    return "auth:signInForm.invalidCredentials";
  }
  return null;
}
