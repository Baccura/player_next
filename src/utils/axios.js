import axios from 'axios';

// 1. Créer l’instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// 2. Interceptor requête
api.interceptors.request.use(request => {
  console.log('[Axios Request]', {
    method: request.method,
    url: request.baseURL + request.url,
    headers: request.headers,
    data: request.data,
  });
  return request;
});

// 3. Interceptor réponse
api.interceptors.response.use(
  response => {
    console.log('[Axios Response]', {
      status: response.status,
      url: response.config.baseURL + response.config.url,
      data: response.data,
    });
    return response;
  },
  error => {
    console.error('[Axios Error]', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default api;