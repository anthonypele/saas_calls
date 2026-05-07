const API_URL = import.meta.env.VITE_API_URL;

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL || ""}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}
