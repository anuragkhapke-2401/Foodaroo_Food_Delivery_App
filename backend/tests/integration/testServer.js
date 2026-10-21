import app from "../../app.js";

/**
 * Creates and starts a test HTTP server on an ephemeral OS-assigned port.
 * Returns baseUrl, client helper function, and close() teardown function.
 */
export const startTestServer = () => {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      const baseUrl = `http://127.0.0.1:${port}`;

      const request = async (path, options = {}) => {
        const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
        const headers = { ...options.headers };

        let body = options.body;
        if (body && typeof body === "object" && !(body instanceof FormData)) {
          headers["Content-Type"] = "application/json";
          body = JSON.stringify(body);
        }

        const response = await fetch(url, {
          ...options,
          headers,
          body,
        });

        const contentType = response.headers.get("content-type") || "";
        let data = null;
        if (contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        return {
          status: response.status,
          headers: response.headers,
          data,
        };
      };

      const close = () =>
        new Promise((res, rej) => {
          server.close((err) => (err ? rej(err) : res()));
        });

      resolve({ baseUrl, request, close, server });
    });

    server.on("error", reject);
  });
};
