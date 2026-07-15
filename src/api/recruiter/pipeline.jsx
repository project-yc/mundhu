// Recruiter Pipeline API
import { authAxios } from '../../lib/axios';

export const getPipeline = async (assessmentId) => {
  const params = new URLSearchParams();
  params.set('page_size', '1000');
  if (assessmentId) params.set('assessment_id', assessmentId);
  return authAxios.get(`/api/v1/recruiter/pipeline?${params.toString()}`);
};

export const getNeedsAction = async (assessmentId) => {
  const params = new URLSearchParams();
  params.set('page_size', '1000');
  if (assessmentId) params.set('assessment_id', assessmentId);
  return authAxios.get(`/api/v1/recruiter/pipeline/needs-action?${params.toString()}`);
};

export const updatePipelineCandidate = async (instanceId, payload) => {
  return authAxios.patch(`/api/v1/recruiter/candidates/${instanceId}/pipeline`, payload);
};
