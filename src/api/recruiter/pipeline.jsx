// Recruiter Pipeline API
import { authFetch } from '../../utils/authFetch';

const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `HTTP Error: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

export const getPipeline = async (assessmentId) => {
  const params = new URLSearchParams();
  params.set('page_size', '1000');
  if (assessmentId) params.set('assessment_id', assessmentId);
  const res = await authFetch(`/api/v1/recruiter/pipeline?${params.toString()}`);
  return handleApiError(res);
};

export const getNeedsAction = async (assessmentId) => {
  const params = new URLSearchParams();
  params.set('page_size', '1000');
  if (assessmentId) params.set('assessment_id', assessmentId);
  const res = await authFetch(`/api/v1/recruiter/pipeline/needs-action?${params.toString()}`);
  return handleApiError(res);
};

export const updatePipelineCandidate = async (instanceId, payload) => {
  const res = await authFetch(`/api/v1/recruiter/candidates/${instanceId}/pipeline`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleApiError(res);
};
