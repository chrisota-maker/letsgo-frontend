export const API = import.meta.env.VITE_API_URL;

// Sends a request to the LetsGo API and returns the parsed JSON response.
// Throws an Error carrying the server's message and HTTP status if the request fails.
export async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(data?.error ?? "Something went wrong.");
    error.status = response.status;
    throw error;
  }

  return data;
}