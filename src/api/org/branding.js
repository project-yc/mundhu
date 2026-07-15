// Org branding API.
//
// Endpoint contract (backend):
//   GET /api/v1/recruiter/org/branding -> { brand_color: '#22D3EE', logo_url?: string, name?: string }
//
// If the endpoint isn't implemented yet, this resolves with `null` so the UI
// silently falls back to localStorage / palette default.

import { authAxios } from '../../lib/axios';

export async function fetchOrgBranding() {
  try {
    return await authAxios.get('/api/v1/recruiter/org/branding');
  } catch {
    return null;
  }
}

export async function updateOrgBranding(payload) {
  return authAxios.patch('/api/v1/recruiter/org/branding', payload);
}
