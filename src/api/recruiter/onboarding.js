import { authAxios } from '../../lib/axios';

export async function saveOrgDetails(data) {
  return authAxios.patch('/api/orgs/v1/onboarding', data);
}

export async function sendInvites(invites) {
  return authAxios.post('/api/orgs/v1/invites', { invites });
}

export async function launchWorkspace({ logo, brand_color, candidate_name, tagline }) {
  const formData = new FormData();
  if (logo) formData.append('logo', logo);
  formData.append('brand_color', brand_color);
  formData.append('candidate_name', candidate_name || '');
  formData.append('tagline', tagline || '');

  return authAxios.post('/api/orgs/v1/onboarding/launch', formData);
}
