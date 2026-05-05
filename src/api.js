import { initialMockCalls } from "./mockCalls.js";

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = "saas_calls_mock_calls";

function readMockCalls() {
  try {
    const storedCalls = window.localStorage.getItem(STORAGE_KEY);
    return storedCalls ? JSON.parse(storedCalls) : initialMockCalls;
  } catch {
    return initialMockCalls;
  }
}

function writeMockCalls(calls) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
  } catch {
    // The mock API can still work for reads if localStorage is unavailable.
  }
}

async function mockApi(path, options = {}) {
  const method = options.method || "GET";
  const calls = readMockCalls();

  if (method === "GET" && path === "/api/calls") {
    return { calls };
  }

  const callDetailMatch = path.match(/^\/api\/calls\/(\d+)$/);

  if (method === "GET" && callDetailMatch) {
    const callId = Number(callDetailMatch[1]);
    return { call: calls.find((call) => call.id === callId) || null };
  }

  if (method === "POST" && path === "/api/calls") {
    const formCall = JSON.parse(options.body || "{}");
    const nextId = Math.max(0, ...calls.map((call) => call.id)) + 1;
    const createdCall = {
      ...formCall,
      id: nextId,
      duration_seconds: Number(formCall.duration_seconds) || 0,
    };

    writeMockCalls([createdCall, ...calls]);
    return { call: createdCall };
  }

  throw new Error("Mock endpoint is not available");
}

export async function api(path, options = {}) {
  if (!API_URL) {
    return mockApi(path, options);
  }

  const response = await fetch(`${API_URL}${path}`, {
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
