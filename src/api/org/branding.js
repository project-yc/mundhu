// Org branding API.
//
// Endpoint contract (backend):
//   GET /api/v1/recruiter/org/branding -> { brand_color: '#22D3EE', logo_url?: string, name?: string }
//
// If the endpoint isn't implemented yet, this resolves with `null` so the UI
// silently falls back to localStorage / palette default.

import { authFetch } from '../../utils/authFetch';

export async function fetchOrgBranding() {
  try {
    const res = await authFetch('/api/v1/recruiter/org/branding');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateOrgBranding(payload) {
  const res = await authFetch('/api/v1/recruiter/org/branding', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Failed to update branding (${res.status})`);
  }
  return res.json();
}
