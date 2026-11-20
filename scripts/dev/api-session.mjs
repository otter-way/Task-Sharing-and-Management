// A signed-in user talking to the local API: keeps the session cookie between
// requests and sends the web app's origin, as the browser would.

export function apiSession({ apiUrl, clientUrl }) {
  let cookie = "";

  async function call(method, path, body) {
    const response = await fetch(`${apiUrl}/api/${path}`, {
      method,
      headers: {
        Origin: clientUrl,
        ...(cookie ? { Cookie: cookie } : {}),
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const setCookies = response.headers.getSetCookie();
    if (setCookies.length > 0) {
      cookie = setCookies.map((value) => value.split(";")[0]).join("; ");
    }
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const reason = data?.message ?? data?.error ?? text;
      const error = new Error(
        `${method} /api/${path}: ${response.status} ${reason}`,
      );
      error.status = response.status;
      throw error;
    }
    return data;
  }

  return {
    get: (path) => call("GET", path),
    post: (path, body) => call("POST", path, body ?? {}),
    put: (path, body) => call("PUT", path, body),
  };
}
