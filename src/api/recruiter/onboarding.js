import { authFetch } from '../../utils/authFetch';

export async function saveOrgDetails(data) {
  const res = await authFetch('/api/orgs/v1/onboarding', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || 'Failed to save org details');
  }
  return res.json();
}

export async function sendInvites(invites) {
  const res = await authFetch('/api/orgs/v1/invites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invites }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || 'Failed to send invites');
  }
  return res.json();
}

export async function launchWorkspace({ logo, brand_color, candidate_name, tagline }) {
  const formData = new FormData();
  if (logo) formData.append('logo', logo);
  formData.append('brand_color', brand_color);
  formData.append('candidate_name', candidate_name || '');
  formData.append('tagline', tagline || '');

  const res = await authFetch('/api/orgs/v1/onboarding/launch', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || 'Failed to launch workspace');
  }
  return res.json();
}
