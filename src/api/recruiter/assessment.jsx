import { authAxios, forceLogout } from '../../lib/axios';

/**
 * Upload a pre-built zip file to S3 via the upload API.
 * Returns { s3_key: string }
 */
export const uploadTaskZip = async (zipFile, onProgress) => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();
  formData.append('file', zipFile);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/v1/tasks/upload-zip');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
    }

    xhr.onload = () => {
      if (xhr.status === 401) {
        forceLogout();
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch { reject(new Error('Invalid response from upload server')); }
      } else {
        try {
          const body = JSON.parse(xhr.responseText);
          reject(new Error(body.detail || body.error || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed — network error'));
    xhr.send(formData);
  });
};

export const createAssessment = async (name, description, duration_minutes, config_json = {}) => {
  return authAxios.post('/api/v1/create/assessment', {
    name,
    description,
    duration_minutes,
    config_json,
  });
};

export const getAllAssessments = async () => {
  return authAxios.get('/api/assessments/all');
};

export const getAssessmentById = async (id) => {
  return authAxios.get(`/api/v1/assessment/${id}`);
};

export const getTasksByAssessmentId = async (assessmentId) => {
  return authAxios.get(`/api/v1/assessment/${assessmentId}`);
};

export const createTask = async (
  assessmentId,
  title,
  description,
  tags = [],
  files = [],
  additionalInfo = {},
  sourceType = 'local',
  gitRepoUrl = null,
  gitBranch = null,
  taskZipS3Key = null,
  starterBundleS3Key = null,
  graderBundleS3Key = null,
  taskManifestJson = null,
) => {
  if (files.length > 0) {
    const formData = new FormData();
    formData.append('assessment_id', assessmentId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', JSON.stringify(tags));
    formData.append('additional_info', JSON.stringify(additionalInfo || {}));
    formData.append('source_type', sourceType);
    if (sourceType === 'git') {
      formData.append('git_repo_url', gitRepoUrl || '');
      formData.append('git_branch', gitBranch || '');
    }

    files.forEach((file) => {
      const relativeName = file.webkitRelativePath || file.name;
      formData.append('files', file, relativeName);
      formData.append('relative_paths', relativeName);
    });

    return authAxios.post('/api/v1/create/task', formData);
  }

  return authAxios.post('/api/v1/create/task', {
    assessment_id: assessmentId,
    title,
    description,
    tags,
    additional_info: additionalInfo || {},
    source_type: sourceType,
    git_repo_url: sourceType === 'git' ? gitRepoUrl : null,
    git_branch: sourceType === 'git' ? gitBranch : null,
    ...(taskZipS3Key ? { task_zip_s3_key: taskZipS3Key } : {}),
    ...(starterBundleS3Key ? { starter_bundle_s3_key: starterBundleS3Key } : {}),
    ...(graderBundleS3Key ? { grader_bundle_s3_key: graderBundleS3Key } : {}),
    ...(taskManifestJson ? { task_manifest_json: taskManifestJson } : {}),
  });
};

export const getTaskById = async (taskId) => {
  return authAxios.get(`/api/v1/tasks/${taskId}`);
};

export const updateTask = async (taskId, payload) => {
  return authAxios.patch(`/api/v1/tasks/${taskId}`, payload);
};

export const verifyGitSource = async ({ taskId = null, gitRepoUrl, gitBranch }) => {
  const endpoint = taskId
    ? `/api/admin/tasks/${taskId}/verify-git-source`
    : '/api/v1/tasks/verify-git-source';
  return authAxios.post(endpoint, {
    git_repo_url: gitRepoUrl,
    git_branch: gitBranch,
  });
};

export const sendCandidateInvites = async (assessmentId, candidates) => {
  return authAxios.post(`/api/v1/assessment/${assessmentId}/invite`, {
    candidates: candidates.map(c => ({
      name: c.name,
      email: c.email,
    })),
  });
};

export const getRecruiterStats = async () => {
  return authAxios.get('/api/v1/recruiter/stats');
};

export const getAssessmentCandidates = async (assessmentId) => {
  return authAxios.get(`/api/v1/recruiter/assessment/${assessmentId}/candidates`);
};

export const getCandidatesWithReports = async (assessmentId, { pageSize = 1000 } = {}) => {
  const params = new URLSearchParams();
  params.set('page_size', String(pageSize));
  return authAxios.get(`/api/v1/recruiter/assessment/${assessmentId}/candidates/reports?${params.toString()}`);
};

export const getRecruiterReportDetail = async (assessmentId, sessionId) => {
  return authAxios.get(`/api/v1/analytics/assessments/${assessmentId}/reports/${sessionId}`);
};

export const getSessionReport = getRecruiterReportDetail;
