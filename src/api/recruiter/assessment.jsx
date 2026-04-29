const getAuthToken = () => localStorage.getItem('authToken');

/**
 * Upload a pre-built zip file to S3 via the upload API.
 * Returns { s3_key: string }
 */
export const uploadTaskZip = async (zipFile, onProgress) => {
  const token = getAuthToken();
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

export const createAssessment = async (name, description, duration_minutes) => {
  try {
    const token = getAuthToken();
    const response = await fetch('/api/v1/create/assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
        duration_minutes,
        config_json: {},
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
    const token = getAuthToken();
    const response = await fetch('/api/assessments/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

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
    const token = getAuthToken();
    const response = await fetch(`/api/v1/assessment/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

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
    const token = getAuthToken();
    const response = await fetch(`/api/v1/assessment/${assessmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

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
) => {
  try {
    const token = getAuthToken();
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

      response = await fetch('/api/v1/create/task', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
    } else {
      response = await fetch('/api/v1/create/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
    const token = getAuthToken();
    const response = await fetch(`/api/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

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
    const token = getAuthToken();
    const response = await fetch(`/api/v1/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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
    const token = getAuthToken();
    const endpoint = taskId
      ? `/api/admin/tasks/${taskId}/verify-git-source`
      : '/api/v1/tasks/verify-git-source';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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
    const token = getAuthToken();
    const response = await fetch(`/api/v1/assessment/${assessmentId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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
  const token = getAuthToken();
  const response = await fetch('/api/v1/recruiter/stats', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  return handleApiError(response);
};

export const getAssessmentCandidates = async (assessmentId) => {
  const token = getAuthToken();
  const response = await fetch(`/api/v1/recruiter/assessment/${assessmentId}/candidates`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  return handleApiError(response);
};
