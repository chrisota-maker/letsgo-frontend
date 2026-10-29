export const API = import.meta.env.VITE_API_URL;

// Sends a request to the LetsGo API and returns the parsed JSON response.
// Throws an Error carrying the server's message and HTTP status if the request fails.
// apiFetch(path, {method = "GET", body, token}={}) does two things. The first is apiFetch(parameter1, parameter2). 
// The second is that it automatically destructures the object in parameter2 and creates three variables: method, body, and token. 
// If method is not assigned a value from the caller it automatically assigns "GET".
// If no second argument is passed = {} allows the three variables of method, body and token to be created anyways. 


export async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  //body: body ? JSON.stringify(body) means if there is a body use that and convert to JSON if not mark it as undefined.

  const text = await response.text();
  //this is a protection for line 27, if the response is blank as in the case of a delete the JSON.parse would crash.

  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(data?.error ?? "Something went wrong.");
    error.status = response.status;
    throw error;
  }

  return data;
}