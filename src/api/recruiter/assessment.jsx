const getAuthToken = () => localStorage.getItem('authToken');

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

export const createTask = async (assessmentId, title, description, tags = [], files = []) => {
  try {
    const token = getAuthToken();
    let response;

    if (files.length > 0) {
      const formData = new FormData();
      formData.append('assessment_id', assessmentId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', JSON.stringify(tags));

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
