const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function handleResponse(res) {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody.error || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return res.json();
}

export async function uploadResume({ file, user }) {
  const form = new FormData();
  form.append('file', file);
  if (user?.email) form.append('userEmail', user.email);
  if (user?.name) form.append('userName', user.name);

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: form
  });
  return handleResponse(res);
}

export async function runAnalysis({ analysisId, jobDescription, text, user }) {
  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      analysisId,
      jobDescription,
      text,
      userEmail: user?.email,
      userName: user?.name
    })
  });
  return handleResponse(res);
}

export async function fetchAnalysis(id) {
  const res = await fetch(`${API_BASE_URL}/api/analysis/${id}`);
  return handleResponse(res);
}

export async function fetchHistory({ userId, email }) {
  if (userId) {
    const res = await fetch(`${API_BASE_URL}/api/history/${userId}`);
    return handleResponse(res);
  }
  if (!email) return [];
  const url = new URL(`${API_BASE_URL}/api/history`);
  url.searchParams.append('email', email);
  const res = await fetch(url);
  return handleResponse(res);
}

export async function fetchStats(userId) {
  if (!userId) return null;
  const res = await fetch(`${API_BASE_URL}/api/stats/${userId}`);
  return handleResponse(res);
}

export async function sendChatMessage({ message, context }) {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context })
  });
  return handleResponse(res);
}

