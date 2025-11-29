import axios from 'axios';

// Use environment variable or default to localhost
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('[API] Using base URL:', API_BASE);

export const uploadResume = async ({ file, user }) => {
  try {
    console.log('[UPLOAD] Sending file to:', `${API_BASE}/upload`);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Add user info if provided
    if (user?.email) {
      formData.append('userEmail', user.email);
    }
    if (user?.name) {
      formData.append('userName', user.name);
    }

    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });
    
    console.log('[UPLOAD] Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[UPLOAD] Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message || 'Upload failed');
  }
};

export const analyzeResume = async (analysisId, jobDescription, resumeText) => {
  try {
    console.log('[ANALYZE] Sending request to:', `${API_BASE}/analyze`);
    
    const response = await axios.post(`${API_BASE}/analyze`, {
      analysisId,
      jobDescription,
      resumeText,
    }, {
      timeout: 60000, // 60 second timeout for LLM
    });
    
    console.log('[ANALYZE] Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[ANALYZE] Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message || 'Analysis failed');
  }
};

export const getHistory = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE}/history/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

// Fetch analysis by ID
export const fetchAnalysis = async (analysisId) => {
  try {
    const response = await axios.get(`${API_BASE}/analysis/${analysisId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch analysis');
  }
};

// Fetch history by email or userId
export const fetchHistory = async ({ userId, email }) => {
  try {
    if (email) {
      const response = await axios.get(`${API_BASE}/history`, {
        params: { email }
      });
      return response.data;
    } else if (userId) {
      const response = await axios.get(`${API_BASE}/history/${userId}`);
      return response.data;
    }
    return [];
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch history');
  }
};

// Run analysis (alias for analyzeResume with different parameter structure)
export const runAnalysis = async ({ analysisId, jobDescription, text, user }) => {
  try {
    const response = await axios.post(`${API_BASE}/analyze`, {
      analysisId,
      jobDescription,
      text,
      userEmail: user?.email,
      userName: user?.name
    }, {
      timeout: 60000
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || 'Analysis failed');
  }
};

// Send chat message
export const sendChatMessage = async ({ message, context }) => {
  try {
    const response = await axios.post(`${API_BASE}/chat`, {
      message,
      context
    }, {
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || 'Chat request failed');
  }
};

