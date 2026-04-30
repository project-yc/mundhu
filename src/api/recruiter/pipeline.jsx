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
  const url = assessmentId
    ? `/api/v1/recruiter/pipeline?assessment_id=${assessmentId}`
    : `/api/v1/recruiter/pipeline`;
  const res = await authFetch(url);
  return handleApiError(res);
};

export const getNeedsAction = async (assessmentId) => {
  const url = assessmentId
    ? `/api/v1/recruiter/pipeline/needs-action?assessment_id=${assessmentId}`
    : `/api/v1/recruiter/pipeline/needs-action`;
  const res = await authFetch(url);
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
