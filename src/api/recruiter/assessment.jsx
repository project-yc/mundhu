import { authFetch, forceLogout } from '../../utils/authFetch';

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

const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `HTTP Error: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const createAssessment = async (name, description, duration_minutes, config_json = {}) => {
  try {
    const response = await authFetch('/api/v1/create/assessment', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        name,
        description,
        duration_minutes,
        config_json,
      }),
    });

    return handleApiError(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};

export const getAllAssessments = async () => {
  try {
    const response = await authFetch('/api/assessments/all');
    return handleApiError(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};

export const getAssessmentById = async (id) => {
  try {
    const response = await authFetch(`/api/v1/assessment/${id}`);
    return handleApiError(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};

export const getTasksByAssessmentId = async (assessmentId) => {
  try {
    const response = await authFetch(`/api/v1/assessment/${assessmentId}`);
    return handleApiError(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
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
  try {
    let response;

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

      // No Content-Type header — browser sets it with the correct FormData boundary
      response = await authFetch('/api/v1/create/task', {
        method: 'POST',
        body: formData,
      });
    } else {
      response = await authFetch('/api/v1/create/task', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({
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
        }),
      });
    }

    return handleApiError(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};

export const getTaskById = async (taskId) => {
  try {
    const response = await authFetch(`/api/v1/tasks/${taskId}`);
    return handleApiError(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};

export const updateTask = async (taskId, payload) => {
  try {
    const response = await authFetch(`/api/v1/tasks/${taskId}`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });
    return handleApiError(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};

export const verifyGitSource = async ({ taskId = null, gitRepoUrl, gitBranch }) => {
  try {
    const endpoint = taskId
      ? `/api/admin/tasks/${taskId}/verify-git-source`
      : '/api/v1/tasks/verify-git-source';
    const response = await authFetch(endpoint, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        git_repo_url: gitRepoUrl,
        git_branch: gitBranch,
      }),
    });
    return handleApiError(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};

export const sendCandidateInvites = async (assessmentId, candidates) => {
  try {
    const response = await authFetch(`/api/v1/assessment/${assessmentId}/invite`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        candidates: candidates.map(c => ({
          name: c.name,
          email: c.email,
        })),
      }),
    });

    return handleApiError(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw error;
  }
};

export const getRecruiterStats = async () => {
  const response = await authFetch('/api/v1/recruiter/stats');
  return handleApiError(response);
};

export const getAssessmentCandidates = async (assessmentId) => {
  const response = await authFetch(`/api/v1/recruiter/assessment/${assessmentId}/candidates`);
  return handleApiError(response);
};

export const getCandidatesWithReports = async (assessmentId) => {
  const response = await authFetch(`/api/v1/recruiter/assessment/${assessmentId}/candidates/reports`);
  return handleApiError(response);
};

export const getSessionReport = async (assessmentId, sessionId) => {
  const response = await authFetch(`/api/v1/analytics/assessments/${assessmentId}/reports/${sessionId}`);
  return handleApiError(response);
};
